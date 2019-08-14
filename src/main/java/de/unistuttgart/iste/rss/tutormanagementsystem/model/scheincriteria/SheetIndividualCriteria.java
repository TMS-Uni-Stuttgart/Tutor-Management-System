package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.persistence.Entity;
import javax.persistence.Transient;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.IsScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaNumber;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaPossiblePercentage;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.BeanService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.SheetService;
import lombok.AccessLevel;
import lombok.Getter;

/**
 * SheetIndividualCriteria
 */
@Getter
@Entity
@IsScheinCriteria(identifier = "sheetIndividual")
public class SheetIndividualCriteria extends PossiblePercentageCriteria {

    @Transient
    @Getter(value = AccessLevel.NONE)
    private SheetService sheetService = BeanService.getBean(SheetService.class);

    @ScheinCriteriaPossiblePercentage(toggledBy = "percentagePerSheet")
    @ScheinCriteriaNumber(min = 0)
    private double valuePerSheetNeeded;

    private boolean percentagePerSheet;

    @Override
    public boolean isPassed(Student student) {
        double passedSheets = 0d;
        double allSheets = 0d;

        for (Sheet sheet : sheetService.getAllSheets()) {
            double result = student.getPoints(sheet);
            double maxPointsPerSheet;
            if (!sheet.isBonusSheet()) {
                allSheets += 1d;
                maxPointsPerSheet = sheet.calculateMaxPoints();
            } else {
                maxPointsPerSheet = sheet.calculateMaxPointsWithBonus();
            }
            if (this.isPercentagePerSheet()) {
                if (Double.compare(result / maxPointsPerSheet,
                        this.getValuePerSheetNeeded()) >= 0) {
                    passedSheets += 1d;
                }
            } else {
                if (Double.compare(result, this.getValuePerSheetNeeded()) >= 0) {
                    passedSheets += 1d;
                }
            }
        }
        if (this.isPercentage()) {
            return Double.compare(passedSheets / allSheets, this.getValueNeeded()) >= 0;
        } else {
            return Double.compare(passedSheets, this.getValueNeeded()) >= 0;
        }
    }

    @Override
    public ScheinCriteriaStatusResponseDTO getStatusDTO(Student student) {

        Map<UUID, ScheinCriteriaAdditionalStatusResponseDTO> infos = new HashMap<>();
        double achieved = 0d;
        var sheets = sheetService.getAllSheets();


        for (var sheet : sheets) {
            double result = student.getPoints(sheet);
            double maxPointsPerSheet = sheet.calculateMaxPoints();
            PassedState state;

            if (this.isPercentagePerSheet()) {
                if (Double.compare(result / maxPointsPerSheet,
                        this.getValuePerSheetNeeded()) >= 0) {
                    state = PassedState.PASSED;
                    achieved += 1d;
                } else {
                    state = PassedState.NOTPASSED;
                }
            } else {
                if (Double.compare(result, this.getValuePerSheetNeeded()) >= 0) {
                    state = PassedState.PASSED;
                    achieved += 1d;
                } else {
                    state = PassedState.NOTPASSED;
                }
            }

            infos.put(sheet.getId(), new ScheinCriteriaAdditionalStatusResponseDTO(result,
                    maxPointsPerSheet, sheet.getSheetNo(), ScheinCriteriaUnit.POINT, state));
        }
        return new ScheinCriteriaStatusResponseDTO(this.getId(), this.getIdentifier(),
                this.getName(), achieved, sheets.size(), ScheinCriteriaUnit.SHEET,
                this.isPassed(student), infos);
    }
}
