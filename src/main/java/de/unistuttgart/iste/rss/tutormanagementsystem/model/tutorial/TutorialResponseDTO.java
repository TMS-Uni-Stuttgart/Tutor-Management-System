package de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial;

import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;
import lombok.Getter;

/**
 * Represents a {@link Tutorial} returned by the REST API.
 */
@Getter
public class TutorialResponseDTO extends HasId {
    private final int slot;

    private final Optional<UUID> tutor;

    private final List<Instant> dates;

    private final LocalTime startTime;

    private final LocalTime endTime;

    private final List<UUID> correctors;

    private final List<UUID> students;

    private final List<UUID> teams;

    private final Map<Instant, UUID> substitutes;

    TutorialResponseDTO() {
        this(new Tutorial());
    }

    public TutorialResponseDTO(final Tutorial tutorial) {
        super(tutorial.getId());

        this.slot = tutorial.getSlot();

        Optional<User> tutor = tutorial.getTutor();
        this.tutor = Optional.ofNullable(tutor.isPresent() ? tutor.get().getId() : null);

        this.dates = new ArrayList<>(tutorial.getDates());
        this.startTime = tutorial.getStartTime();
        this.endTime = tutorial.getEndTime();

        this.correctors = HasId.convertToListOfUUIDs(tutorial.getCorrectors());
        this.students = HasId.convertToListOfUUIDs(tutorial.getStudents());
        this.teams = HasId.convertToListOfUUIDs(tutorial.getTeams());

        this.substitutes = new HashMap<>();

        for (var entry : tutorial.getSubstitutes().entrySet()) {
            this.substitutes.put(entry.getKey(), entry.getValue());
        }
    }
}
