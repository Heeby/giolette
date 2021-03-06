#### v1.0.0 (02.09.2017)

- `icon`-Eigenschaft für Preise muss nicht mehr gesetzt werden und ist standardmäßig `generic`
- Beim Laden der Preislisten werden Preise mit einem weight von 0 oder weniger ignoriert
- Einheitliches, violettes Theme
- Content in 4 Tabs unterteilt (Status, Prizes, Chat Prizes, Color Editor)
- Color Editor und Chat Prizes implementiert
- Sicherheitsmaßnahme hinzugefügt, die einen Wechsel des Tabs nach dem Start der APIs verbietet
- Standardgröße des Fensters angepasst
- Layout vom Status-Tab hinsichtlich der Übersichtlichkeit verbessert
- Button für Chat Spin hinzugefügt
- Icons für "Custom Spin"-Button und "Chat Spin"-Button hinzugefügt
- Automatischer Chat Spin Trigger alle x Minuten
- Logik für zufällige Auswahl aus der Zuschauerliste implementiert
- 3 neue Zähler hinzugefügt im Status-Tab (Custom Spins, Chat Spins, Automatische Chat Spins)
- Points im BrowserSource werden jetzt animiert, wenn Points gewonnen werden
- Kennzeichnnung von Chat Spins (Gratisdreh!) im BrowserSource hinzugefügt
- Abstand zwischen Preiskästen und Glücksradnadel im BrowserSource um `15px` erhöht
- Dependency Upgrade
- Neue Konfigurationsdatei `chat_prizes.yml`
- Neue Konfigurationseigenschaften `twitchPublic.channel_name` und `twitchPublic.chat_spin_interval_minutes`

#### v1.1.0 (03.09.2017)

- Namensfilter für Chat Spins hinzugefügt
- Dynamisches Icon für "Test APIs"-Button hinzugefügt
- Icon für "Start Tipeee"-Button hinzugefügt
- Default Theme aus dem BrowserSource entfernt
- Neue Konfigurationseigenschaft `twitchPublic.excludes`

#### v1.2.0 (03.09.2017)

- Namensfilter für Chat Spins gefixt
- Dependency Upgrade

#### v1.3.0 (04.09.2017)

- Punkte-Animation wird jetzt richtig versteckt bei Nicht-Punkte-Gewinnen
- Startzahl und Endzahl der Punkte-Animation im BrowserSource nach unten korrigiert
- Changelog-Tab hinzugefügt

#### v1.4.0 (12.09.2017)

- Dependency Upgrade
- Logging verbessert und neue Log Messages hinzugefügt
- Logging Engine integriert, die in `stdout` und `giolette-config/log.txt` schreibt
- Reste der unbenutzen Twitch OAuth Routine entfernt

#### v1.5.0 (22.09.2017)

- Dependency Upgrade (electron 1.7.6, electron-builder 19.29.1, electron-prebuilt-compile 1.7.6, postcss-import 11.0.0, webpack-dev-server 2.8.2, yarn 1.0.2, request 2.82.0, ws 3.2.0)
- Methode integriert, die sich nach Verbindungsabbruch zu Tipeee selbstständig neu bei sso.tipeeestream.com einloggt
- Notification hinzugefügt, die erscheint, wenn eine neue Verbindung zu Tipeee hergestellt wird
