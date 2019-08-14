package de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial;

import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.lang.Nullable;
import lombok.Getter;

/**
 * CreateTutorialDTO
 */
@Getter
public class TutorialDTO {

    private int slot;
    private Optional<UUID> tutorId;
    private List<UUID> correctorIds;

    private List<Instant> dates;
    private LocalTime startTime;
    private LocalTime endTime;

    TutorialDTO() {}

    public TutorialDTO(final int slot, final UUID tutorId, final List<Instant> dates,
            final LocalTime startTime, final LocalTime endTime) {
        this(slot, tutorId, dates, startTime, endTime, new ArrayList<>());
    }

    public TutorialDTO(final int slot, @Nullable final UUID tutorId, final List<Instant> dates,
            final LocalTime startTime, final LocalTime endTime, final List<UUID> correctorIds) {
        this.slot = slot;
        this.tutorId = Optional.ofNullable(tutorId);
        this.dates = dates;
        this.startTime = startTime;
        this.endTime = endTime;

        this.correctorIds = correctorIds;
    }

}
