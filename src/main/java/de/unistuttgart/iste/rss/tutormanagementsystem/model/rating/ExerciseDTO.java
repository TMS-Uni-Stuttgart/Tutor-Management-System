package de.unistuttgart.iste.rss.tutormanagementsystem.model.rating;

import lombok.Getter;

/**
 * ExerciseDTO
 */
@Getter
public class ExerciseDTO {

    private int exNo;
    private double maxPoints;
    private boolean bonus;

    ExerciseDTO() {}


    public ExerciseDTO(final int exNo, final double maxPoints, final boolean bonus) {
        this.exNo = exNo;
        this.maxPoints = maxPoints;
        this.bonus = bonus;
    }

}
