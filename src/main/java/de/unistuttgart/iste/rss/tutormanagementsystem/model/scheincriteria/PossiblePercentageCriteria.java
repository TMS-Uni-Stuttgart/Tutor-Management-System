package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import javax.persistence.Entity;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaNumber;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaPossiblePercentage;
import lombok.Getter;

/**
 * PossiblePercentageCriteria
 */
@Getter
@Entity
public abstract class PossiblePercentageCriteria extends ScheinCriteria {

    private boolean percentage;

    @ScheinCriteriaPossiblePercentage(toggledBy = "percentage")
    @ScheinCriteriaNumber(min = 0)
    private double valueNeeded;
}
