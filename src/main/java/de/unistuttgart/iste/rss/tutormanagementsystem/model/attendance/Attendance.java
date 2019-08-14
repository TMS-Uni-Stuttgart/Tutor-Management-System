package de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import javax.annotation.Nullable;
import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import lombok.Getter;

/**
 * Attendance
 */
@Entity
@Getter
public class Attendance {

    @EmbeddedId
    private AttendanceId id;

    @Enumerated(EnumType.STRING)
    private AttendanceState state;

    @Nullable
    private String note;

    @Column(insertable = false, updatable = false)
    private Instant date;

    Attendance() {}

    public Attendance(final UUID studentId, final Instant date, final AttendanceState state) {
        this(studentId, date, state, null);
    }

    public Attendance(final UUID studentId, final Instant date, final AttendanceState state,
            final String note) {
        this(new AttendanceId(studentId, date), date, state, note);
    }

    public Attendance(final AttendanceId id, final Instant date, final AttendanceState state,
            final String note) {
        this.id = id;
        this.date = date;
        this.state = state;
        this.note = note;
    }

    public Optional<AttendanceState> getState() {
        return Optional.ofNullable(state);
    }

    public Optional<String> getNote() {
        return Optional.ofNullable(note);
    }
}
