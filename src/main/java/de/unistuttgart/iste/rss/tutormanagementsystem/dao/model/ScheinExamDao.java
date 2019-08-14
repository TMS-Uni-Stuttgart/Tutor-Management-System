package de.unistuttgart.iste.rss.tutormanagementsystem.dao.model;

import java.util.List;
import java.util.UUID;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExam;

/**
 * ScheinExamDao
 */
public interface ScheinExamDao {
    public List<ScheinExam> getAllScheinExams();

    public ScheinExam saveScheinExam(final ScheinExam ScheinExam);

    public void deleteScheinExam(final UUID id) throws ElementNotFoundException;

    public ScheinExam getScheinExam(final UUID id) throws ElementNotFoundException;

}
