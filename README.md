# Interakcija čovek računar 2026

Izvorni kod sa vežbi iz predmeta Interakcija čovek računar na 4. godini Tehničkog Fakulteta Univerziteta Singidunum.

Aplikacija je razvijena koristeći sledeće tehnologije:
- Angular 20
- Bootstrap 5.3
- Fonts Awesome 7 
- Axios HTTP Client
- Rasa Open Source

## Pokretanje projekta

Kako bi pokrenuli projekat potrebno je da posedujete Node 22 i Bun runtime na vašem računaru.
Aplikaciju pokrećete uz pomoć komande "bun start".

Kako bi se i chatbot pokrenuo potrebno je otvoriti jos 2 terminala:
  1. Za treniranje modela
    - Otvoriti chatbot folder ovog projekta
    - Pokrenuti rasabot okruzenje komandom "conda activate rasabot"
    - Trenirati model komandom "rasa train"
    - Nakon zavrsenog treniranja pokrenuti "rasa run --enable-api --cors "*""
    
  2. Za akcije
    - Otvoriti isti chatbot folder ovog projekta kao i za treniranje
    - Pokrenuti rasabot okruzenje komandom "conda activate rasabot"
    - Pokrenuti akxije komandom "rasa run actions"