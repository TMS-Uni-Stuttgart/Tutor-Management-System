package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import javax.persistence.Entity;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.IsScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaNumber;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import lombok.Getter;

/**
 * PresentationCriteria
 */
@Getter
@Entity
@IsScheinCriteria(identifier = "presentation")
public class PresentationCriteria extends ScheinCriteria {

    @ScheinCriteriaNumber(min = 0)
    private int presentationsNeeded;

    @Override
    public boolean isPassed(Student student) {
        double sum = student.getPresentationPoints().values().stream().reduce(0d,
                (value, prev) -> value + prev);

        return Double.compare(sum, this.presentationsNeeded) >= 0;
    }

    @Override
    public ScheinCriteriaStatusResponseDTO getStatusDTO(Student student) {
        double achieved = student.getPresentationPoints().values().stream().reduce(0d,
                (value, prev) -> value + prev);

        return new ScheinCriteriaStatusResponseDTO(this.getId(), this.getIdentifier(),
                this.getName(), achieved, this.getPresentationsNeeded(),
                ScheinCriteriaUnit.PRESENTATION, this.isPassed(student));
    }

}
