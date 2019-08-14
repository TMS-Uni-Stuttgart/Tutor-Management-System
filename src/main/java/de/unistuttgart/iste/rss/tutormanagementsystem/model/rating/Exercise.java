package de.unistuttgart.iste.rss.tutormanagementsystem.model.rating;

import javax.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * Exercise
 */
@Embeddable
@Getter
@EqualsAndHashCode
public class Exercise {

    private int exNo;
    private double maxPoints;
    private boolean bonus;

    Exercise() {
        this(-1, -1, false);
    }

    public Exercise(final int exNo, final double maxPoints, final boolean bonus) {
        this.exNo = exNo;
        this.maxPoints = maxPoints;
        this.bonus = bonus;
    }
}
