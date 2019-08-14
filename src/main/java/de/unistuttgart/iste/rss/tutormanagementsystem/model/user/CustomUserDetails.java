package de.unistuttgart.iste.rss.tutormanagementsystem.model.user;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * CustomUserDetails
 */
public class CustomUserDetails implements UserDetails {

    private static final long serialVersionUID = 1L;
    private final UUID id;
    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(final User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();

        this.authorities = generateAuthorities(user);
    }

    private Collection<? extends GrantedAuthority> generateAuthorities(final User user) {
        final List<GrantedAuthority> authorities = new ArrayList<>();

        for (var role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority(role.toString()));
        }

        return authorities;
        // return new ArrayList<>(Arrays.asList(new
        // SimpleGrantedAuthority(user.getRole().toString())));
    }

    public UUID getUserId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
