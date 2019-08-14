package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.ExerciseDTO;
import lombok.Getter;

/**
 * ScheinExamDTO
 */
@Getter
public class ScheinExamDTO {

    private final int scheinExamNo;

    private final List<ExerciseDTO> exercises;

    private final Instant date;

    private final double percentageNeeded;

    ScheinExamDTO() {
        this(0, new ArrayList<>(), Instant.now(), 0);
    }

    public ScheinExamDTO(final int scheinExamNo, final List<ExerciseDTO> exercises,
            final Instant date, final double percentageNeeded) {
        this.scheinExamNo = scheinExamNo;
        this.exercises = exercises;
        this.date = date;
        this.percentageNeeded = percentageNeeded;
    }

}
