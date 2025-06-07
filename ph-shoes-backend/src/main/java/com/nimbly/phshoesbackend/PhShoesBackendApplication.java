package com.nimbly.phshoesbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@EnableSpringDataWebSupport
@SpringBootApplication
public class PhShoesBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PhShoesBackendApplication.class, args);
	}

}
