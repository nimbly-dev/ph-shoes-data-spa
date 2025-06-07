package com.nimbly.phshoesbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;
import java.util.Objects;

@Data
@Embeddable
public class FactProductShoesId implements Serializable {

    @Column(name = "ID", length = 16777216)
    private String id;

    @Column(name = "DWID", length = 16777216)
    private String dwid;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FactProductShoesId that)) return false;
        return Objects.equals(id, that.id) &&
                Objects.equals(dwid, that.dwid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, dwid);
    }

}
