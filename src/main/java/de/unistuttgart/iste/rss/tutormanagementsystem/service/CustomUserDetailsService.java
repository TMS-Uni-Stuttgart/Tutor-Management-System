package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.repositories.UserRepository;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.CustomUserDetails;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.user.User;

/**
 * MyUserDetailsService
 */
@Service("userDetailsService")
@Transactional
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        final Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("No user found with username: " + username);
        }

        return new CustomUserDetails(user.get());
    }
}
