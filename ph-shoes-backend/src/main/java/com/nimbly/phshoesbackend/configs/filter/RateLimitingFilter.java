package com.nimbly.phshoesbackend.configs.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    /**
     * One semaphore per client IP. Each semaphore has exactly 1 permit.
     * If a request is already holding the permit, any new request from the
     * same IP will block at semaphore.acquire() until the first one completes.
     */
    private final Map<String, Semaphore> ipSemaphores = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Example: only apply this filter to the "/search" endpoint.
        // Remove or modify this if you want to enforce one‐at‐a‐time on all paths.
        String path = request.getRequestURI();
        return !path.startsWith("/api/v1/fact-product-shoes/search");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        String clientIp = extractClientIp(request);

        // Get or create a semaphore for this IP. The semaphore has 1 permit.
        Semaphore semaphore = ipSemaphores.computeIfAbsent(clientIp, ip -> new Semaphore(1));

        try {
            // Acquire the single permit—if another request from the same IP
            // is in progress, this call will block until that request finishes.
            semaphore.acquire();
        } catch (InterruptedException ex) {
            // If interrupted while waiting, restore the interrupt flag and return 503.
            Thread.currentThread().interrupt();
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.getWriter().write("Interrupted while waiting for previous request to finish.");
            return;
        }

        try {
            // Now we’ve acquired the permit; proceed down the filter chain.
            filterChain.doFilter(request, response);
        } finally {
            // Release the permit so that the next waiting request (if any) can proceed.
            semaphore.release();
            // Optional cleanup: if nobody is waiting and no permits are in use, remove the entry.
            if (semaphore.availablePermits() == 1 && !semaphore.hasQueuedThreads()) {
                ipSemaphores.remove(clientIp);
            }
        }
    }

    /**
     * Extract the client’s IP address, checking X-Forwarded-For first.
     * If you’re behind a proxy or load balancer, ensure X-Forwarded-For is set.
     */
    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            // X-Forwarded-For might contain a comma-separated list—take the first one.
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
