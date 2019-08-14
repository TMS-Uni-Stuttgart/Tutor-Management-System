package de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * AttendanceId
 */
@Getter
@Embeddable
@EqualsAndHashCode
public class AttendanceId implements Serializable {

    private static final long serialVersionUID = 1L;

    // Important note: Hibernate (for some reason) can NOT find a correct length for this column -
    // even though it can for most of the other UUIDs (?). Therefore one has to set it manually
    // especially because this UUID is part of an ID. If the length is not the correct one (and if
    // it does NOT match the length of the UUID in the student) the SQL query on updating an entry
    // will fail.
    @Column(length = 16)
    private UUID studentId;

    private Instant date;

    AttendanceId() {}

    public AttendanceId(final UUID studentId, final Instant date) {
        this.studentId = studentId;
        this.date = date;
    }

}
