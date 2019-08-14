package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import lombok.Getter;

/**
 * ScheinExamResponseDTO
 */
@Getter
public class ScheinExamResponseDTO extends HasId {

    private final int scheinExamNo;

    private final List<Exercise> exercises;

    private final Instant date;

    private final double percentageNeeded;

    ScheinExamResponseDTO() {
        this(new ScheinExam());
    }

    public ScheinExamResponseDTO(final ScheinExam exam) {
        super(exam.getId());

        this.scheinExamNo = exam.getScheinExamNo();
        this.exercises = new ArrayList<>(exam.getExercises());
        this.date = exam.getDate();
        this.percentageNeeded = exam.getPercentageNeeded();
    }

}
