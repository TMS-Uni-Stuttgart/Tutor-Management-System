package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import lombok.Getter;

/**
 * ScheinCriteriaAdditionalStatusResponseDTO
 */
@Getter
public class ScheinCriteriaAdditionalStatusResponseDTO {

    private final double achieved;
    private final double total;
    private final int no;

    @Enumerated(EnumType.STRING)
    private ScheinCriteriaUnit unit;

    @Enumerated(EnumType.STRING)
    private PassedState state;

    public ScheinCriteriaAdditionalStatusResponseDTO(final double achieved, final double total,
            final int no, ScheinCriteriaUnit unit, PassedState state) {
        this.achieved = achieved;
        this.total = total;
        this.no = no;
        this.unit = unit;
        this.state = state;
    }
}
