package de.unistuttgart.iste.rss.tutormanagementsystem.model.rating;

import java.io.Serializable;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * PointId
 */
@Getter
@Embeddable
@EqualsAndHashCode
public class PointId implements Serializable {

    private static final long serialVersionUID = 1L;

    // One has to specify the length of the column manually bc hibernate (for some reason) is not
    // able to derive the correct length.
    // If the length is NOT specified updating points will NOT work anymore!
    @Column(length = 16)
    private UUID id;

    private int exerciseNo;

    PointId() {}

    public PointId(final UUID id, final int exerciseNo) {
        this.id = id;
        this.exerciseNo = exerciseNo;
    }

    public PointId(final HasId id, final Exercise exercise) {
        this(id.getId(), exercise.getExNo());
    }

    @Override
    public String toString() {
        // This string has to be derived from the attributes because this class is used as a key in
        // a HashMap. That alone would not require this function however the string needs to be
        // generatable in the frontend aswell which does not work with the default toString()
        // implementation of Object.
        return "ID::" + id + "--Ex::" + exerciseNo;
    }
}
