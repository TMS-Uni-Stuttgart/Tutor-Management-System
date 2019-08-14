package de.unistuttgart.iste.rss.tutormanagementsystem.model.rating;

import java.util.UUID;
import lombok.Getter;

/**
 * DTO which includes a date and the corresponding points for that date.
 */
@Getter
public class PresentationPointsDTO {

    private UUID sheetId;
    private double points;

    PresentationPointsDTO() {}
}
