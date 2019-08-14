package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import lombok.Getter;

/**
 * ScheinExam
 */
@Entity
@Getter
public class ScheinExam extends HasId {

    private final int scheinExamNo;

    @ElementCollection
    private final List<Exercise> exercises;

    private final Instant date;

    private final double percentageNeeded;

    ScheinExam() {
        this(UUID.randomUUID(), -1, new ArrayList<>(), Instant.now(), 0);
    }

    public ScheinExam(final UUID id, final int scheinExamNo, final List<Exercise> exercises,
            final Instant date, final double percentageNeeded) {
        super(id);

        this.scheinExamNo = scheinExamNo;
        this.exercises = new ArrayList<>(exercises);
        this.date = date;
        this.percentageNeeded = percentageNeeded;
    }

    public double calculateTotalPoints() {
        return this.exercises.stream().mapToDouble(ex -> ex.isBonus() ? 0 : ex.getMaxPoints())
                .sum();
    }

}
