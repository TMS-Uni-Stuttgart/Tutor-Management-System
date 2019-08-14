package de.unistuttgart.iste.rss.tutormanagementsystem.model.rating;

import java.util.List;
import lombok.Getter;

/**
 * SheetDTO
 */
@Getter
public class SheetDTO {

    private int sheetNo;
    private boolean bonusSheet;

    private List<ExerciseDTO> exercises;

    SheetDTO() {}

    public SheetDTO(final int sheetNo, final List<ExerciseDTO> exercises,
            final boolean bonusSheet) {
        this.sheetNo = sheetNo;
        this.exercises = exercises;
        this.bonusSheet = bonusSheet;
    }
}
