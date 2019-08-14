package de.unistuttgart.iste.rss.tutormanagementsystem.model.rating;

import java.util.Map;
import java.util.UUID;
import lombok.Getter;

/**
 * UpdatePointsDTO
 */
@Getter
public class UpdatePointsDTO {
    private UUID id;
    private Map<Integer, Double> exercises;

    UpdatePointsDTO() {}
}
