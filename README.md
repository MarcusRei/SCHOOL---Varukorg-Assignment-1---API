# 💻 inlämningsuppgift 1 - Varukorg
Utbildning: **Frontend developer på medieinstitutet**

Kurs: **API-Utveckling**

## 🧰 Techstack
- JS
- NodeJS
- GraphQL
- Apollo Server

## Lärarens direktiv
Du skall skapa ett GraphQL API för en shopping cart med NodeJS och Apollo Server. Via API:et bör man kunna skicka requests för:

- Skapa varukorg(och få tillbaka ett autogenererat id)
- Töm (delete) varukorg
- Lägga till en produkt i varukorgen
- Ta bort en produkt från varukorgen
- Hämta varukorgen med hjälp av ett id

#### En varukorg bör ha följande data:
- Id
- Totalkostnad (“total price”) av alla produkter i varukorgen
- De produkter som ligger i varukorgen. En produkt bör bestå av följande data:
- Artikelnummer/produkt id
- Produktnamn
- Enhetspris (aka priset för 1 produkt)

Använd JSON filer för att spara data på servern.
