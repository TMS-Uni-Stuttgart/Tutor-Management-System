package de.unistuttgart.iste.rss.tutormanagementsystem.dao;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.ScheinExamDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.ScheinExamRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExam;

/**
 * ScheinExamAccessService
 */
@Repository
public class ScheinExamDataAccessService implements ScheinExamDao {

    @Autowired
    private ScheinExamRepository scheinExamRepository;

    @Override
    public List<ScheinExam> getAllScheinExams() {
        return scheinExamRepository.findAll();
    }

    @Override
    public ScheinExam getScheinExam(UUID id) throws ElementNotFoundException {
        Optional<ScheinExam> scheinExam = scheinExamRepository.findById(id);

        if (scheinExam.isEmpty()) {
            throw new ElementNotFoundException();
        }
        return scheinExam.get();
    }

    @Override
    public ScheinExam saveScheinExam(ScheinExam scheinExam) {
        return scheinExamRepository.save(scheinExam);
    }

    @Override
    public void deleteScheinExam(UUID id) throws ElementNotFoundException {
        try {
            scheinExamRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new ElementNotFoundException();
        }

    }

}
