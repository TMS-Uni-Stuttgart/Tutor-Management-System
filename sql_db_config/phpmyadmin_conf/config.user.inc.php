<?php
/* Encrypted connection to DB */
$cfg['Servers'][$i]['ssl'] = true;
$cfg['Servers'][$i]['ssl_ca'] = '/etc/phpmyadmin/ssl/ca.pem';
$cfg['Servers'][$i]['ssl_cert'] = '/etc/phpmyadmin/ssl/client-cert.pem';
$cfg['Servers'][$i]['ssl_key'] = '/etc/phpmyadmin/ssl/client-key.pem';
$cfg['Servers'][$i]['ssl_ciphers'] = 'DHE-RSA-AES256-SHA';