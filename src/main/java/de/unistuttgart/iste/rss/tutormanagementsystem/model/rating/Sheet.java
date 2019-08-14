package de.unistuttgart.iste.rss.tutormanagementsystem.model.rating;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * Sheet
 */
@Entity
@Getter
@EqualsAndHashCode(callSuper = true)
public class Sheet extends HasId {

    private int sheetNo;
    private boolean bonusSheet;

    @ElementCollection
    private List<Exercise> exercises;

    Sheet() {
        this(UUID.randomUUID(), -1, new ArrayList<>(), false);
    }

    public Sheet(final UUID id, final int sheetNo, final List<Exercise> exercises,
            final boolean bonusSheet) {
        super(id);

        this.sheetNo = sheetNo;
        this.exercises = new ArrayList<>(exercises);
        this.bonusSheet = bonusSheet;
    }

    /**
     * Iterates over all exercises of a sheet and calculates max. gainable points without the bonus
     * exercises.
     * 
     * @return maxPoints without bonus points
     */
    public double calculateMaxPoints() {
        double maxPoints = 0d;
        for (Exercise exercise : this.exercises) {
            if (!exercise.isBonus()) {
                maxPoints += exercise.getMaxPoints();
            }
        }
        return maxPoints;
    }

    /**
     * Iterates over all exercises of a sheet and calculates max. gainable points with the bonus
     * exercises.
     * 
     * @return maxPoints with bonus points
     */
    public double calculateMaxPointsWithBonus() {
        double maxPoints = 0d;
        for (Exercise exercise : this.exercises) {
            maxPoints += exercise.getMaxPoints();
        }
        return maxPoints;
    }
}
