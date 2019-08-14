package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.persistence.Entity;
import javax.persistence.Transient;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.IsScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.BeanService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.SheetService;
import lombok.AccessLevel;
import lombok.Getter;

/**
 * SheetTotalCriteria
 */
@Getter
@Entity
@IsScheinCriteria(identifier = "sheetTotal")
public class SheetTotalCriteria extends PossiblePercentageCriteria {

    @Transient
    @Getter(value = AccessLevel.NONE)
    private SheetService sheetService = BeanService.getBean(SheetService.class);

    @Override
    public boolean isPassed(Student student) {
        double obtainedPointsOnAllSheets = 0d, maxObtainablePoints = 0d;

        for (Sheet sheet : sheetService.getAllSheets()) {
            if (!sheet.isBonusSheet()) {
                obtainedPointsOnAllSheets += student.getPoints(sheet);
                maxObtainablePoints += sheet.calculateMaxPoints();
            } else {
                obtainedPointsOnAllSheets += student.getPoints(sheet);
            }
        }

        if (this.isPercentage()) {
            return Double.compare(obtainedPointsOnAllSheets / maxObtainablePoints,
                    this.getValueNeeded()) >= 0;
        } else {
            return Double.compare(obtainedPointsOnAllSheets, this.getValueNeeded()) >= 0;
        }
    }

    @Override
    public ScheinCriteriaStatusResponseDTO getStatusDTO(Student student) {

        Map<UUID, ScheinCriteriaAdditionalStatusResponseDTO> infos = new HashMap<>();

        Double achieved = 0d;
        Double total = 0d;

        var sheets = sheetService.getAllSheets();

        for (Sheet sheet : sheets) {
            achieved += student.getPoints(sheet);
            total += sheet.calculateMaxPoints();

            infos.put(sheet.getId(), new ScheinCriteriaAdditionalStatusResponseDTO(achieved, total,
                    sheet.getSheetNo(), ScheinCriteriaUnit.POINT, PassedState.IGNORE));
        }
        return new ScheinCriteriaStatusResponseDTO(this.getId(), this.getIdentifier(),
                this.getName(), achieved, total, ScheinCriteriaUnit.POINT, this.isPassed(student));
    }

}
