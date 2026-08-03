# Prompt Generator Ollama

Windows-Desktop-App, die Bilder mit einem selbst gewählten Ollama-Vision-Modell analysiert und daraus bildgetreue Prompts für Krea 2 erstellt.

[Neueste Windows-Version herunterladen](https://github.com/Twilight1971/prompt-generator-ollama/releases/latest)

## Voraussetzungen

- Windows 10 oder 11
- Ein erreichbarer Ollama-Server (lokal oder im Netzwerk)
- Mindestens ein installiertes Ollama-Modell; für Bildanalysen muss es Vision unterstützen

Lokale Einrichtung:

```powershell
ollama pull qwen2.5vl:7b
ollama serve
```

In der App kann als Server beispielsweise `http://127.0.0.1:11434` oder `http://192.168.1.50:11434` eingetragen werden. Die App prüft die Fähigkeiten aller installierten Modelle und zeigt nur Modelle mit Ollamas `vision`-Capability an. Serveradresse und ausgewähltes Modell werden lokal gespeichert. Ein API-Key ist nicht erforderlich.

Die Generierung arbeitet zweistufig: Das Vision-Modell erstellt zuerst eine rein faktische Bildanalyse. Ein zweiter Aufruf formuliert daraus einen natürlichen, kompakten Krea-2-Prompt. Die Bildanalyse ist in der App über einen eigenen Tab sichtbar.

## Windows-App verwenden

Die portable Datei liegt nach dem Build unter:

```text
dist/Prompt-Generator-Ollama-3.3.0.exe
```

Die EXE kann ohne Installer gestartet werden. Ollama und das Vision-Modell selbst sind nicht in der EXE enthalten.

GitHub Releases stellt die portable EXE sowohl direkt als auch in einer ZIP-Datei bereit. Mit `SHA256SUMS.txt` kann der Download überprüft werden. Da die App derzeit nicht kommerziell codesigniert ist, kann Windows SmartScreen beim ersten Start „Unbekannter Herausgeber“ anzeigen.

## Entwicklung und Build

```powershell
npm install
npm start
npm run dist
```

## Architektur

- `index.html` – Benutzeroberfläche und Prompt-Logik
- `main.js` – Electron-Fenster und sichere Weiterleitung an die konfigurierte Ollama-API
- `preload.js` – schmale IPC-Brücke zwischen Oberfläche und Desktop-Prozess
- `package.json` – Start- und Build-Konfiguration

Die Oberfläche hat keinen Node.js-Zugriff. Netzwerkaufrufe an Ollama laufen über den isolierten Electron-Hauptprozess, sodass keine Browser-CORS-Konfiguration erforderlich ist.

## Datenschutz

Bilder und Prompts werden ausschließlich an die in der App eingetragene Ollama-Adresse gesendet. Verlauf, Sprache, Theme, Serveradresse und Modellname bleiben lokal in der App gespeichert.

## Lizenz

MIT
