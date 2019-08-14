package de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;

/**
 * SubstituteDTO
 */
@Getter
public class SubstituteDTO {

    private final UUID tutorId;
    private final List<Instant> dates;

    SubstituteDTO() {
        this(UUID.randomUUID(), new ArrayList<>());
    }

    public SubstituteDTO(final UUID tutorId, final List<Instant> dates) {
        this.tutorId = tutorId;
        this.dates = new ArrayList<>(dates);
    }

}
