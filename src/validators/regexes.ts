// Regex koji matcha hrvatske mobilne brojeve: pocinje sa pozivnim za drzavu ili lokaknim prefiksom (0), validira prefikse operatera,
// validira broj znamenaka (6 ili 7) opcionalno odvojenih spaceovima ili crticama
export const croatianMobileRegex = /^(\+385|0)(91|92|95|97|98|99)[\s-]?\d{3}[\s-]?\d{3,4}$/;

// Regex koji matcha hrvatska imena ulica, barem 2 slova i onda jos rijeci koje mogu biti odvojene crticama ili spaceovima
export const croatianStreetRegex = /^[A-Za-zČčĆćŽžŠšĐđ]{2,}(\s[A-Za-zČčĆčŽžŠšĐđ]{1,})*$/;

// Regex koji matcha sve moguce varijacije kucnih brojeva: broj, broj i slovo ili bb (bez broja)
export const croataianStreetNumberRegex = /^\d{1,5}[A-Za-z]{0,1}$|^bb$/;

// Regex koji matcha ispravne hrvatske postanske brojeve: prva znamenka mora biti 1-5, i jos 4 znamenke iza toga
export const croatianPostcodeRegex = /^[1-5]\d{4}$/;

// Regex koji matcha ispravne hrvatske gradove: string slova
export const croatianTownRegex = /^[A-Za-zČĆŽŠĐčćžšđ\s\-']+$/