package de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceId;

/**
 * AttendanceRepository
 */
public interface AttendanceRepository extends JpaRepository<Attendance, AttendanceId> {

}
