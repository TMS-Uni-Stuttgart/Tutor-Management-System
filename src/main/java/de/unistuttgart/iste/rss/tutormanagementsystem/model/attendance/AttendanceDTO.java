package de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance;

import java.time.Instant;
import java.util.Optional;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceState;
import lombok.Getter;

/**
 * AttendanceDTO
 */
@Getter
public class AttendanceDTO {
    @Enumerated(EnumType.STRING)
    private Optional<AttendanceState> state;

    private Optional<String> note;

    private Instant date;

    AttendanceDTO() {}

    public AttendanceDTO(final AttendanceState state, final Instant date) {
        this(state, date, null);
    }

    public AttendanceDTO(final AttendanceState state, final Instant date, final String note) {
        this.state = Optional.ofNullable(state);
        this.note = Optional.ofNullable(note);
        this.date = date;
    }
}
