package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import java.util.Optional;
import javax.persistence.Entity;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.IsScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceState;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;

/**
 * AttendanceCriteria
 */
@Entity
@IsScheinCriteria(identifier = "attendance")
public class AttendanceCriteria extends PossiblePercentageCriteria {

    @Override
    public boolean isPassed(Student student) {
        int all = student.getTutorial().getDates().size();

        double visited = 0;

        for (var entry : student.getAttendance().entrySet()) {
            var attendance = entry.getValue();

            Optional<AttendanceState> state = attendance.getState();
            if (state.isPresent()) {
                if (state.get().equals(AttendanceState.PRESENT)
                        || state.get().equals(AttendanceState.EXCUSED)) {
                    visited += 1;
                }
            }
        }

        if (this.isPercentage()) {
            return Double.compare(visited / all, this.getValueNeeded()) >= 0;
        } else {
            return Double.compare(visited, this.getValueNeeded()) >= 0;
        }
    }

    @Override
    public ScheinCriteriaStatusResponseDTO getStatusDTO(Student student) {
        int total = 0;
        int achieved = 0;
        for (var entry : student.getAttendance().entrySet()) {
            total += 1;
            var state = entry.getValue().getState().get();
            if (state.equals(AttendanceState.PRESENT) || state.equals(AttendanceState.EXCUSED)) {
                achieved += 1;
            }
        }
        return new ScheinCriteriaStatusResponseDTO(this.getId(), this.getIdentifier(),
                this.getName(), achieved, total, ScheinCriteriaUnit.DATE, this.isPassed(student));
    }

}
