import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

interface LessonSeed {
  title: string
  description: string
  category: string
  level: number
  orderIndex: number
  xpReward: number
  exercises: Array<{
    type: string
    question: string
    correctAnswer: string
    options: string[]
    hint?: string
  }>
}

const LANGUAGE_PAIRS: Array<{ target: string; code: string }> = [
  { target: 'Spanish', code: 'es' },
  { target: 'French', code: 'fr' },
  { target: 'German', code: 'de' },
  { target: 'Chinese', code: 'zh' },
  { target: 'Arabic', code: 'ar' },
  { target: 'Yoruba', code: 'yo' },
  { target: 'Hindi', code: 'hi' },
  { target: 'Swahili', code: 'sw' },
]

function generateLessonsForLanguage(targetLang: string): LessonSeed[] {
  const lessons: LessonSeed[] = []
  let orderIdx = 0

  // Vocabulary lessons (10xp each) - Levels 1-2
  const vocabLessons: Array<{ title: string; desc: string; words: Array<{ q: string; a: string }> }> = []

  switch (targetLang) {
    case 'Spanish':
      vocabLessons.push(
        { title: 'Greetings & Introductions', desc: 'Learn basic Spanish greetings', words: [
          { q: 'How do you say "Hello"?', a: 'Hola' }, { q: 'How do you say "Goodbye"?', a: 'Adiós' },
          { q: 'How do you say "Good morning"?', a: 'Buenos días' }, { q: 'How do you say "Good night"?', a: 'Buenas noches' },
          { q: 'How do you say "Thank you"?', a: 'Gracias' }, { q: 'How do you say "Please"?', a: 'Por favor' },
        ]},
        { title: 'Food & Drinks', desc: 'Common Spanish food vocabulary', words: [
          { q: 'How do you say "Water"?', a: 'Agua' }, { q: 'How do you say "Bread"?', a: 'Pan' },
          { q: 'How do you say "Milk"?', a: 'Leche' }, { q: 'How do you say "Chicken"?', a: 'Pollo' },
          { q: 'How do you say "Rice"?', a: 'Arroz' }, { q: 'How do you say "Coffee"?', a: 'Café' },
        ]},
        { title: 'Numbers 1-10', desc: 'Learn Spanish numbers', words: [
          { q: 'How do you say "One"?', a: 'Uno' }, { q: 'How do you say "Two"?', a: 'Dos' },
          { q: 'How do you say "Three"?', a: 'Tres' }, { q: 'How do you say "Five"?', a: 'Cinco' },
          { q: 'How do you say "Seven"?', a: 'Siete' }, { q: 'How do you say "Ten"?', a: 'Diez' },
        ]},
        { title: 'Colors', desc: 'Learn Spanish color names', words: [
          { q: 'How do you say "Red"?', a: 'Rojo' }, { q: 'How do you say "Blue"?', a: 'Azul' },
          { q: 'How do you say "Green"?', a: 'Verde' }, { q: 'How do you say "Yellow"?', a: 'Amarillo' },
          { q: 'How do you say "Black"?', a: 'Negro' }, { q: 'How do you say "White"?', a: 'Blanco' },
        ]},
        { title: 'Family Members', desc: 'Spanish family vocabulary', words: [
          { q: 'How do you say "Mother"?', a: 'Madre' }, { q: 'How do you say "Father"?', a: 'Padre' },
          { q: 'How do you say "Brother"?', a: 'Hermano' }, { q: 'How do you say "Sister"?', a: 'Hermana' },
          { q: 'How do you say "Son"?', a: 'Hijo' }, { q: 'How do you say "Daughter"?', a: 'Hija' },
        ]},
        { title: 'Animals', desc: 'Spanish animal names', words: [
          { q: 'How do you say "Dog"?', a: 'Perro' }, { q: 'How do you say "Cat"?', a: 'Gato' },
          { q: 'How do you say "Bird"?', a: 'Pájaro' }, { q: 'How do you say "Fish"?', a: 'Pez' },
          { q: 'How do you say "Horse"?', a: 'Caballo' }, { q: 'How do you say "Rabbit"?', a: 'Conejo' },
        ]},
        { title: 'Weather', desc: 'Spanish weather terms', words: [
          { q: 'How do you say "Sun"?', a: 'Sol' }, { q: 'How do you say "Rain"?', a: 'Lluvia' },
          { q: 'How do you say "Hot"?', a: 'Caliente' }, { q: 'How do you say "Cold"?', a: 'Frío' },
          { q: 'How do you say "Wind"?', a: 'Viento' }, { q: 'How do you say "Snow"?', a: 'Nieve' },
        ]},
        { title: 'Clothing', desc: 'Spanish clothing vocabulary', words: [
          { q: 'How do you say "Shirt"?', a: 'Camisa' }, { q: 'How do you say "Pants"?', a: 'Pantalones' },
          { q: 'How do you say "Dress"?', a: 'Vestido' }, { q: 'How do you say "Shoes"?', a: 'Zapatos' },
          { q: 'How do you say "Hat"?', a: 'Sombrero' }, { q: 'How do you say "Coat"?', a: 'Abrigo' },
        ]},
        { title: 'Body Parts', desc: 'Spanish body part names', words: [
          { q: 'How do you say "Head"?', a: 'Cabeza' }, { q: 'How do you say "Hand"?', a: 'Mano' },
          { q: 'How do you say "Eye"?', a: 'Ojo' }, { q: 'How do you say "Heart"?', a: 'Corazón' },
          { q: 'How do you say "Foot"?', a: 'Pie' }, { q: 'How do you say "Mouth"?', a: 'Boca' },
        ]},
        { title: 'Emotions', desc: 'Spanish emotion words', words: [
          { q: 'How do you say "Happy"?', a: 'Feliz' }, { q: 'How do you say "Sad"?', a: 'Triste' },
          { q: 'How do you say "Angry"?', a: 'Enojado' }, { q: 'How do you say "Scared"?', a: 'Asustado' },
          { q: 'How do you say "Tired"?', a: 'Cansado' }, { q: 'How do you say "Love"?', a: 'Amor' },
        ]},
      )
      break
    case 'French':
      vocabLessons.push(
        { title: 'Greetings & Introductions', desc: 'Learn basic French greetings', words: [
          { q: 'How do you say "Hello"?', a: 'Bonjour' }, { q: 'How do you say "Goodbye"?', a: 'Au revoir' },
          { q: 'How do you say "Good morning"?', a: 'Bonjour' }, { q: 'How do you say "Good night"?', a: 'Bonne nuit' },
          { q: 'How do you say "Thank you"?', a: 'Merci' }, { q: 'How do you say "Please"?', a: "S'il vous plaît" },
        ]},
        { title: 'Food & Drinks', desc: 'Common French food vocabulary', words: [
          { q: 'How do you say "Water"?', a: 'Eau' }, { q: 'How do you say "Bread"?', a: 'Pain' },
          { q: 'How do you say "Milk"?', a: 'Lait' }, { q: 'How do you say "Chicken"?', a: 'Poulet' },
          { q: 'How do you say "Cheese"?', a: 'Fromage' }, { q: 'How do you say "Wine"?', a: 'Vin' },
        ]},
        { title: 'Numbers 1-10', desc: 'Learn French numbers', words: [
          { q: 'How do you say "One"?', a: 'Un' }, { q: 'How do you say "Two"?', a: 'Deux' },
          { q: 'How do you say "Three"?', a: 'Trois' }, { q: 'How do you say "Five"?', a: 'Cinq' },
          { q: 'How do you say "Seven"?', a: 'Sept' }, { q: 'How do you say "Ten"?', a: 'Dix' },
        ]},
        { title: 'Colors', desc: 'Learn French color names', words: [
          { q: 'How do you say "Red"?', a: 'Rouge' }, { q: 'How do you say "Blue"?', a: 'Bleu' },
          { q: 'How do you say "Green"?', a: 'Vert' }, { q: 'How do you say "Yellow"?', a: 'Jaune' },
          { q: 'How do you say "Black"?', a: 'Noir' }, { q: 'How do you say "White"?', a: 'Blanc' },
        ]},
        { title: 'Family Members', desc: 'French family vocabulary', words: [
          { q: 'How do you say "Mother"?', a: 'Mère' }, { q: 'How do you say "Father"?', a: 'Père' },
          { q: 'How do you say "Brother"?', a: 'Frère' }, { q: 'How do you say "Sister"?', a: 'Sœur' },
          { q: 'How do you say "Son"?', a: 'Fils' }, { q: 'How do you say "Daughter"?', a: 'Fille' },
        ]},
        { title: 'Animals', desc: 'French animal names', words: [
          { q: 'How do you say "Dog"?', a: 'Chien' }, { q: 'How do you say "Cat"?', a: 'Chat' },
          { q: 'How do you say "Bird"?', a: 'Oiseau' }, { q: 'How do you say "Fish"?', a: 'Poisson' },
          { q: 'How do you say "Horse"?', a: 'Cheval' }, { q: 'How do you say "Rabbit"?', a: 'Lapin' },
        ]},
        { title: 'Weather', desc: 'French weather terms', words: [
          { q: 'How do you say "Sun"?', a: 'Soleil' }, { q: 'How do you say "Rain"?', a: 'Pluie' },
          { q: 'How do you say "Hot"?', a: 'Chaud' }, { q: 'How do you say "Cold"?', a: 'Froid' },
          { q: 'How do you say "Wind"?', a: 'Vent' }, { q: 'How do you say "Snow"?', a: 'Neige' },
        ]},
        { title: 'Clothing', desc: 'French clothing vocabulary', words: [
          { q: 'How do you say "Shirt"?', a: 'Chemise' }, { q: 'How do you say "Pants"?', a: 'Pantalon' },
          { q: 'How do you say "Dress"?', a: 'Robe' }, { q: 'How do you say "Shoes"?', a: 'Chaussures' },
          { q: 'How do you say "Hat"?', a: 'Chapeau' }, { q: 'How do you say "Coat"?', a: 'Manteau' },
        ]},
        { title: 'Body Parts', desc: 'French body part names', words: [
          { q: 'How do you say "Head"?', a: 'Tête' }, { q: 'How do you say "Hand"?', a: 'Main' },
          { q: 'How do you say "Eye"?', a: 'Oeil' }, { q: 'How do you say "Heart"?', a: 'Cœur' },
          { q: 'How do you say "Foot"?', a: 'Pied' }, { q: 'How do you say "Mouth"?', a: 'Bouche' },
        ]},
        { title: 'Emotions', desc: 'French emotion words', words: [
          { q: 'How do you say "Happy"?', a: 'Heureux' }, { q: 'How do you say "Sad"?', a: 'Triste' },
          { q: 'How do you say "Angry"?', a: 'En colère' }, { q: 'How do you say "Scared"?', a: 'Effrayé' },
          { q: 'How do you say "Tired"?', a: 'Fatigué' }, { q: 'How do you say "Love"?', a: 'Amour' },
        ]},
      )
      break
    case 'German':
      vocabLessons.push(
        { title: 'Greetings & Introductions', desc: 'Learn basic German greetings', words: [
          { q: 'How do you say "Hello"?', a: 'Hallo' }, { q: 'How do you say "Goodbye"?', a: 'Auf Wiedersehen' },
          { q: 'How do you say "Good morning"?', a: 'Guten Morgen' }, { q: 'How do you say "Good night"?', a: 'Gute Nacht' },
          { q: 'How do you say "Thank you"?', a: 'Danke' }, { q: 'How do you say "Please"?', a: 'Bitte' },
        ]},
        { title: 'Food & Drinks', desc: 'Common German food vocabulary', words: [
          { q: 'How do you say "Water"?', a: 'Wasser' }, { q: 'How do you say "Bread"?', a: 'Brot' },
          { q: 'How do you say "Milk"?', a: 'Milch' }, { q: 'How do you say "Chicken"?', a: 'Hähnchen' },
          { q: 'How do you say "Cheese"?', a: 'Käse' }, { q: 'How do you say "Beer"?', a: 'Bier' },
        ]},
        { title: 'Numbers 1-10', desc: 'Learn German numbers', words: [
          { q: 'How do you say "One"?', a: 'Eins' }, { q: 'How do you say "Two"?', a: 'Zwei' },
          { q: 'How do you say "Three"?', a: 'Drei' }, { q: 'How do you say "Five"?', a: 'Fünf' },
          { q: 'How do you say "Seven"?', a: 'Sieben' }, { q: 'How do you say "Ten"?', a: 'Zehn' },
        ]},
        { title: 'Colors', desc: 'Learn German color names', words: [
          { q: 'How do you say "Red"?', a: 'Rot' }, { q: 'How do you say "Blue"?', a: 'Blau' },
          { q: 'How do you say "Green"?', a: 'Grün' }, { q: 'How do you say "Yellow"?', a: 'Gelb' },
          { q: 'How do you say "Black"?', a: 'Schwarz' }, { q: 'How do you say "White"?', a: 'Weiß' },
        ]},
        { title: 'Family Members', desc: 'German family vocabulary', words: [
          { q: 'How do you say "Mother"?', a: 'Mutter' }, { q: 'How do you say "Father"?', a: 'Vater' },
          { q: 'How do you say "Brother"?', a: 'Bruder' }, { q: 'How do you say "Sister"?', a: 'Schwester' },
          { q: 'How do you say "Son"?', a: 'Sohn' }, { q: 'How do you say "Daughter"?', a: 'Tochter' },
        ]},
        { title: 'Animals', desc: 'German animal names', words: [
          { q: 'How do you say "Dog"?', a: 'Hund' }, { q: 'How do you say "Cat"?', a: 'Katze' },
          { q: 'How do you say "Bird"?', a: 'Vogel' }, { q: 'How do you say "Fish"?', a: 'Fisch' },
          { q: 'How do you say "Horse"?', a: 'Pferd' }, { q: 'How do you say "Bear"?', a: 'Bär' },
        ]},
        { title: 'Weather', desc: 'German weather terms', words: [
          { q: 'How do you say "Sun"?', a: 'Sonne' }, { q: 'How do you say "Rain"?', a: 'Regen' },
          { q: 'How do you say "Hot"?', a: 'Heiß' }, { q: 'How do you say "Cold"?', a: 'Kalt' },
          { q: 'How do you say "Wind"?', a: 'Wind' }, { q: 'How do you say "Snow"?', a: 'Schnee' },
        ]},
        { title: 'Clothing', desc: 'German clothing vocabulary', words: [
          { q: 'How do you say "Shirt"?', a: 'Hemd' }, { q: 'How do you say "Pants"?', a: 'Hose' },
          { q: 'How do you say "Dress"?', a: 'Kleid' }, { q: 'How do you say "Shoes"?', a: 'Schuhe' },
          { q: 'How do you say "Hat"?', a: 'Hut' }, { q: 'How do you say "Coat"?', a: 'Jacke' },
        ]},
        { title: 'Body Parts', desc: 'German body part names', words: [
          { q: 'How do you say "Head"?', a: 'Kopf' }, { q: 'How do you say "Hand"?', a: 'Hand' },
          { q: 'How do you say "Eye"?', a: 'Auge' }, { q: 'How do you say "Heart"?', a: 'Herz' },
          { q: 'How do you say "Foot"?', a: 'Fuß' }, { q: 'How do you say "Mouth"?', a: 'Mund' },
        ]},
        { title: 'Emotions', desc: 'German emotion words', words: [
          { q: 'How do you say "Happy"?', a: 'Glücklich' }, { q: 'How do you say "Sad"?', a: 'Traurig' },
          { q: 'How do you say "Angry"?', a: 'Wütend' }, { q: 'How do you say "Scared"?', a: 'Ängstlich' },
          { q: 'How do you say "Tired"?', a: 'Müde' }, { q: 'How do you say "Love"?', a: 'Liebe' },
        ]},
      )
      break
    case 'Chinese':
      vocabLessons.push(
        { title: 'Greetings & Introductions', desc: 'Learn basic Chinese greetings', words: [
          { q: 'How do you say "Hello"?', a: '你好' }, { q: 'How do you say "Goodbye"?', a: '再见' },
          { q: 'How do you say "Good morning"?', a: '早上好' }, { q: 'How do you say "Good night"?', a: '晚安' },
          { q: 'How do you say "Thank you"?', a: '谢谢' }, { q: 'How do you say "Please"?', a: '请' },
        ]},
        { title: 'Food & Drinks', desc: 'Common Chinese food vocabulary', words: [
          { q: 'How do you say "Water"?', a: '水' }, { q: 'How do you say "Rice"?', a: '米饭' },
          { q: 'How do you say "Tea"?', a: '茶' }, { q: 'How do you say "Noodles"?', a: '面条' },
          { q: 'How do you say "Meat"?', a: '肉' }, { q: 'How do you say "Fruit"?', a: '水果' },
        ]},
        { title: 'Numbers 1-10', desc: 'Learn Chinese numbers', words: [
          { q: 'How do you say "One"?', a: '一' }, { q: 'How do you say "Two"?', a: '二' },
          { q: 'How do you say "Three"?', a: '三' }, { q: 'How do you say "Five"?', a: '五' },
          { q: 'How do you say "Seven"?', a: '七' }, { q: 'How do you say "Ten"?', a: '十' },
        ]},
        { title: 'Colors', desc: 'Learn Chinese color names', words: [
          { q: 'How do you say "Red"?', a: '红色' }, { q: 'How do you say "Blue"?', a: '蓝色' },
          { q: 'How do you say "Green"?', a: '绿色' }, { q: 'How do you say "Yellow"?', a: '黄色' },
          { q: 'How do you say "Black"?', a: '黑色' }, { q: 'How do you say "White"?', a: '白色' },
        ]},
        { title: 'Family Members', desc: 'Chinese family vocabulary', words: [
          { q: 'How do you say "Mother"?', a: '妈妈' }, { q: 'How do you say "Father"?', a: '爸爸' },
          { q: 'How do you say "Brother"?', a: '哥哥' }, { q: 'How do you say "Sister"?', a: '姐姐' },
          { q: 'How do you say "Friend"?', a: '朋友' }, { q: 'How do you say "Family"?', a: '家庭' },
        ]},
        { title: 'Animals', desc: 'Chinese animal names', words: [
          { q: 'How do you say "Dog"?', a: '狗' }, { q: 'How do you say "Cat"?', a: '猫' },
          { q: 'How do you say "Bird"?', a: '鸟' }, { q: 'How do you say "Fish"?', a: '鱼' },
          { q: 'How do you say "Panda"?', a: '熊猫' }, { q: 'How do you say "Dragon"?', a: '龙' },
        ]},
        { title: 'Weather', desc: 'Chinese weather terms', words: [
          { q: 'How do you say "Sun"?', a: '太阳' }, { q: 'How do you say "Rain"?', a: '雨' },
          { q: 'How do you say "Hot"?', a: '热' }, { q: 'How do you say "Cold"?', a: '冷' },
          { q: 'How do you say "Wind"?', a: '风' }, { q: 'How do you say "Snow"?', a: '雪' },
        ]},
        { title: 'Clothing', desc: 'Chinese clothing vocabulary', words: [
          { q: 'How do you say "Clothes"?', a: '衣服' }, { q: 'How do you say "Shirt"?', a: '衬衫' },
          { q: 'How do you say "Shoes"?', a: '鞋子' }, { q: 'How do you say "Hat"?', a: '帽子' },
          { q: 'How do you say "Pants"?', a: '裤子' }, { q: 'How do you say "Dress"?', a: '裙子' },
        ]},
        { title: 'Body Parts', desc: 'Chinese body part names', words: [
          { q: 'How do you say "Head"?', a: '头' }, { q: 'How do you say "Hand"?', a: '手' },
          { q: 'How do you say "Eye"?', a: '眼睛' }, { q: 'How do you say "Heart"?', a: '心' },
          { q: 'How do you say "Foot"?', a: '脚' }, { q: 'How do you say "Mouth"?', a: '嘴' },
        ]},
        { title: 'Emotions', desc: 'Chinese emotion words', words: [
          { q: 'How do you say "Happy"?', a: '高兴' }, { q: 'How do you say "Sad"?', a: '伤心' },
          { q: 'How do you say "Angry"?', a: '生气' }, { q: 'How do you say "Scared"?', a: '害怕' },
          { q: 'How do you say "Love"?', a: '爱' }, { q: 'How do you say "Like"?', a: '喜欢' },
        ]},
      )
      break
    case 'Arabic':
      vocabLessons.push(
        { title: 'Greetings & Introductions', desc: 'Learn basic Arabic greetings', words: [
          { q: 'How do you say "Hello"?', a: 'مرحبا' }, { q: 'How do you say "Goodbye"?', a: 'مع السلامة' },
          { q: 'How do you say "Good morning"?', a: 'صباح الخير' }, { q: 'How do you say "Thank you"?', a: 'شكرا' },
          { q: 'How do you say "Peace"?', a: 'سلام' }, { q: 'How do you say "Please"?', a: 'من فضلك' },
        ]},
        { title: 'Food & Drinks', desc: 'Common Arabic food vocabulary', words: [
          { q: 'How do you say "Water"?', a: 'ماء' }, { q: 'How do you say "Bread"?', a: 'خبز' },
          { q: 'How do you say "Tea"?', a: 'شاي' }, { q: 'How do you say "Coffee"?', a: 'قهوة' },
          { q: 'How do you say "Rice"?', a: 'أرز' }, { q: 'How do you say "Chicken"?', a: 'دجاج' },
        ]},
        { title: 'Numbers 1-10', desc: 'Learn Arabic numbers', words: [
          { q: 'How do you say "One"?', a: 'واحد' }, { q: 'How do you say "Two"?', a: 'اثنان' },
          { q: 'How do you say "Three"?', a: 'ثلاثة' }, { q: 'How do you say "Five"?', a: 'خمسة' },
          { q: 'How do you say "Seven"?', a: 'سبعة' }, { q: 'How do you say "Ten"?', a: 'عشرة' },
        ]},
        { title: 'Colors', desc: 'Learn Arabic color names', words: [
          { q: 'How do you say "Red"?', a: 'أحمر' }, { q: 'How do you say "Blue"?', a: 'أزرق' },
          { q: 'How do you say "Green"?', a: 'أخضر' }, { q: 'How do you say "Yellow"?', a: 'أصفر' },
          { q: 'How do you say "Black"?', a: 'أسود' }, { q: 'How do you say "White"?', a: 'أبيض' },
        ]},
        { title: 'Family Members', desc: 'Arabic family vocabulary', words: [
          { q: 'How do you say "Mother"?', a: 'أم' }, { q: 'How do you say "Father"?', a: 'أب' },
          { q: 'How do you say "Brother"?', a: 'أخ' }, { q: 'How do you say "Sister"?', a: 'أخت' },
          { q: 'How do you say "Son"?', a: 'ابن' }, { q: 'How do you say "Daughter"?', a: 'ابنة' },
        ]},
        { title: 'Animals', desc: 'Arabic animal names', words: [
          { q: 'How do you say "Dog"?', a: 'كلب' }, { q: 'How do you say "Cat"?', a: 'قطة' },
          { q: 'How do you say "Bird"?', a: 'طائر' }, { q: 'How do you say "Fish"?', a: 'سمك' },
          { q: 'How do you say "Horse"?', a: 'حصان' }, { q: 'How do you say "Lion"?', a: 'أسد' },
        ]},
        { title: 'Weather', desc: 'Arabic weather terms', words: [
          { q: 'How do you say "Sun"?', a: 'شمس' }, { q: 'How do you say "Rain"?', a: 'مطر' },
          { q: 'How do you say "Hot"?', a: 'حار' }, { q: 'How do you say "Cold"?', a: 'بارد' },
          { q: 'How do you say "Wind"?', a: 'رياح' }, { q: 'How do you say "Cloud"?', a: 'سحابة' },
        ]},
        { title: 'Clothing', desc: 'Arabic clothing vocabulary', words: [
          { q: 'How do you say "Clothes"?', a: 'ملابس' }, { q: 'How do you say "Shirt"?', a: 'قميص' },
          { q: 'How do you say "Shoes"?', a: 'حذاء' }, { q: 'How do you say "Hat"?', a: 'قبعة' },
          { q: 'How do you say "Dress"?', a: 'فستان' }, { q: 'How do you say "Coat"?', a: 'معطف' },
        ]},
        { title: 'Body Parts', desc: 'Arabic body part names', words: [
          { q: 'How do you say "Head"?', a: 'رأس' }, { q: 'How do you say "Hand"?', a: 'يد' },
          { q: 'How do you say "Eye"?', a: 'عين' }, { q: 'How do you say "Heart"?', a: 'قلب' },
          { q: 'How do you say "Foot"?', a: 'قدم' }, { q: 'How do you say "Mouth"?', a: 'فم' },
        ]},
        { title: 'Emotions', desc: 'Arabic emotion words', words: [
          { q: 'How do you say "Happy"?', a: 'سعيد' }, { q: 'How do you say "Sad"?', a: 'حزين' },
          { q: 'How do you say "Angry"?', a: 'غاضب' }, { q: 'How do you say "Scared"?', a: 'خائف' },
          { q: 'How do you say "Love"?', a: 'حب' }, { q: 'How do you say "Hope"?', a: 'أمل' },
        ]},
      )
      break
    case 'Yoruba':
      vocabLessons.push(
        { title: 'Greetings & Introductions', desc: 'Learn basic Yoruba greetings', words: [
          { q: 'How do you say "Hello"?', a: 'Bawo ni' }, { q: 'How do you say "Goodbye"?', a: 'O dabọ' },
          { q: 'How do you say "Good morning"?', a: 'E kaaro' }, { q: 'How do you say "Good night"?', a: 'O daabọ' },
          { q: 'How do you say "Thank you"?', a: 'E se' }, { q: 'How do you say "Welcome"?', a: 'Ẹ kú àbọ̀' },
        ]},
        { title: 'Food & Drinks', desc: 'Common Yoruba food vocabulary', words: [
          { q: 'How do you say "Water"?', a: 'Omi' }, { q: 'How do you say "Food"?', a: 'Ounjẹ' },
          { q: 'How do you say "Rice"?', a: 'Iresi' }, { q: 'How do you say "Meat"?', a: 'Eran' },
          { q: 'How do you say "Fish"?', a: 'Eja' }, { q: 'How do you say "Milk"?', a: 'Wara' },
        ]},
        { title: 'Numbers 1-10', desc: 'Learn Yoruba numbers', words: [
          { q: 'How do you say "One"?', a: 'Kan' }, { q: 'How do you say "Two"?', a: 'Eji' },
          { q: 'How do you say "Three"?', a: 'Ẹta' }, { q: 'How do you say "Five"?', a: 'Aarun' },
          { q: 'How do you say "Seven"?', a: 'Eje' }, { q: 'How do you say "Ten"?', a: 'Ewa' },
        ]},
        { title: 'Colors', desc: 'Learn Yoruba color names', words: [
          { q: 'How do you say "Red"?', a: 'Pupa' }, { q: 'How do you say "Blue"?', a: 'Bulu' },
          { q: 'How do you say "Green"?', a: 'Awo' }, { q: 'How do you say "Yellow"?', a: 'Yiyo' },
          { q: 'How do you say "Black"?', a: 'Dudu' }, { q: 'How do you say "White"?', a: 'Funfun' },
        ]},
        { title: 'Family Members', desc: 'Yoruba family vocabulary', words: [
          { q: 'How do you say "Mother"?', a: 'Iya' }, { q: 'How do you say "Father"?', a: 'Baba' },
          { q: 'How do you say "Child"?', a: 'Ọmọ' }, { q: 'How do you say "Brother"?', a: 'Egbon' },
          { q: 'How do you say "Sister"?', a: 'Aburo' }, { q: 'How do you say "Family"?', a: 'Ile' },
        ]},
        { title: 'Animals', desc: 'Yoruba animal names', words: [
          { q: 'How do you say "Dog"?', a: 'Aja' }, { q: 'How do you say "Cat"?', a: 'Ologbo' },
          { q: 'How do you say "Bird"?', a: 'Eye' }, { q: 'How do you say "Fish"?', a: 'Eja' },
          { q: 'How do you say "Horse"?', a: 'Esin' }, { q: 'How do you say "Lion"?', a: 'Kiniun' },
        ]},
        { title: 'Weather', desc: 'Yoruba weather terms', words: [
          { q: 'How do you say "Sun"?', a: 'Oorun' }, { q: 'How do you say "Rain"?', a: 'Ojo' },
          { q: 'How do you say "Hot"?', a: 'Gbona' }, { q: 'How do you say "Cold"?', a: 'Otutu' },
          { q: 'How do you say "Wind"?', a: 'Afẹfẹ' }, { q: 'How do you say "Day"?', a: 'Ojo' },
        ]},
        { title: 'Clothing', desc: 'Yoruba clothing vocabulary', words: [
          { q: 'How do you say "Clothes"?', a: 'Aso' }, { q: 'How do you say "Shirt"?', a: 'Bubá' },
          { q: 'How do you say "Wrapper"?', a: 'Iro' }, { q: 'How do you say "Head tie"?', a: 'Gele' },
          { q: 'How do you say "Hat"?', a: 'Fila' }, { q: 'How do you say "Shoes"?', a: 'Bata' },
        ]},
        { title: 'Body Parts', desc: 'Yoruba body part names', words: [
          { q: 'How do you say "Head"?', a: 'Ori' }, { q: 'How do you say "Hand"?', a: 'Owọ' },
          { q: 'How do you say "Eye"?', a: 'Oju' }, { q: 'How do you say "Heart"?', a: 'Okan' },
          { q: 'How do you say "Foot"?', a: 'Ese' }, { q: 'How do you say "Mouth"?', a: 'Enu' },
        ]},
        { title: 'Emotions', desc: 'Yoruba emotion words', words: [
          { q: 'How do you say "Happy"?', a: 'Ayọ' }, { q: 'How do you say "Sad"?', a: 'Ibanujẹ' },
          { q: 'How do you say "Angry"?', a: 'Ibinu' }, { q: 'How do you say "Scared"?', a: 'Iya' },
          { q: 'How do you say "Love"?', a: 'Ife' }, { q: 'How do you say "Peace"?', a: 'Alaafia' },
        ]},
      )
      break
    case 'Hindi':
      vocabLessons.push(
        { title: 'Greetings & Introductions', desc: 'Learn basic Hindi greetings', words: [
          { q: 'How do you say "Hello"?', a: 'नमस्ते' }, { q: 'How do you say "Goodbye"?', a: 'अलविदा' },
          { q: 'How do you say "Good morning"?', a: 'सुप्रभात' }, { q: 'How do you say "Good night"?', a: 'शुभ रात्रि' },
          { q: 'How do you say "Thank you"?', a: 'धन्यवाद' }, { q: 'How do you say "Please"?', a: 'कृपया' },
        ]},
        { title: 'Food & Drinks', desc: 'Common Hindi food vocabulary', words: [
          { q: 'How do you say "Water"?', a: 'पानी' }, { q: 'How do you say "Bread"?', a: 'रोटी' },
          { q: 'How do you say "Tea"?', a: 'चाय' }, { q: 'How do you say "Rice"?', a: 'चावल' },
          { q: 'How do you say "Milk"?', a: 'दूध' }, { q: 'How do you say "Fruit"?', a: 'फल' },
        ]},
        { title: 'Numbers 1-10', desc: 'Learn Hindi numbers', words: [
          { q: 'How do you say "One"?', a: 'एक' }, { q: 'How do you say "Two"?', a: 'दो' },
          { q: 'How do you say "Three"?', a: 'तीन' }, { q: 'How do you say "Five"?', a: 'पांच' },
          { q: 'How do you say "Seven"?', a: 'सात' }, { q: 'How do you say "Ten"?', a: 'दस' },
        ]},
        { title: 'Colors', desc: 'Learn Hindi color names', words: [
          { q: 'How do you say "Red"?', a: 'लाल' }, { q: 'How do you say "Blue"?', a: 'नीला' },
          { q: 'How do you say "Green"?', a: 'हरा' }, { q: 'How do you say "Yellow"?', a: 'पीला' },
          { q: 'How do you say "Black"?', a: 'काला' }, { q: 'How do you say "White"?', a: 'सफेद' },
        ]},
        { title: 'Family Members', desc: 'Hindi family vocabulary', words: [
          { q: 'How do you say "Mother"?', a: 'माँ' }, { q: 'How do you say "Father"?', a: 'पिता' },
          { q: 'How do you say "Brother"?', a: 'भाई' }, { q: 'How do you say "Sister"?', a: 'बहन' },
          { q: 'How do you say "Son"?', a: 'बेटा' }, { q: 'How do you say "Daughter"?', a: 'बेटी' },
        ]},
        { title: 'Animals', desc: 'Hindi animal names', words: [
          { q: 'How do you say "Dog"?', a: 'कुत्ता' }, { q: 'How do you say "Cat"?', a: 'बिल्ली' },
          { q: 'How do you say "Bird"?', a: 'पक्षी' }, { q: 'How do you say "Fish"?', a: 'मछली' },
          { q: 'How do you say "Horse"?', a: 'घोड़ा' }, { q: 'How do you say "Elephant"?', a: 'हाथी' },
        ]},
        { title: 'Weather', desc: 'Hindi weather terms', words: [
          { q: 'How do you say "Sun"?', a: 'सूरज' }, { q: 'How do you say "Rain"?', a: 'बारिश' },
          { q: 'How do you say "Hot"?', a: 'गर्म' }, { q: 'How do you say "Cold"?', a: 'ठंड' },
          { q: 'How do you say "Wind"?', a: 'हवा' }, { q: 'How do you say "Cloud"?', a: 'बादल' },
        ]},
        { title: 'Clothing', desc: 'Hindi clothing vocabulary', words: [
          { q: 'How do you say "Clothes"?', a: 'कपड़े' }, { q: 'How do you say "Shirt"?', a: 'शर्ट' },
          { q: 'How do you say "Shoes"?', a: 'जूते' }, { q: 'How do you say "Hat"?', a: 'टोपी' },
          { q: 'How do you say "Pants"?', a: 'पैंट' }, { q: 'How do you say "Saree"?', a: 'साड़ी' },
        ]},
        { title: 'Body Parts', desc: 'Hindi body part names', words: [
          { q: 'How do you say "Head"?', a: 'सिर' }, { q: 'How do you say "Hand"?', a: 'हाथ' },
          { q: 'How do you say "Eye"?', a: 'आंख' }, { q: 'How do you say "Heart"?', a: 'दिल' },
          { q: 'How do you say "Foot"?', a: 'पैर' }, { q: 'How do you say "Mouth"?', a: 'मुंह' },
        ]},
        { title: 'Emotions', desc: 'Hindi emotion words', words: [
          { q: 'How do you say "Happy"?', a: 'खुश' }, { q: 'How do you say "Sad"?', a: 'उदास' },
          { q: 'How do you say "Angry"?', a: 'गुस्सा' }, { q: 'How do you say "Scared"?', a: 'डर' },
          { q: 'How do you say "Love"?', a: 'प्यार' }, { q: 'How do you say "Peace"?', a: 'शांति' },
        ]},
      )
      break
    case 'Swahili':
      vocabLessons.push(
        { title: 'Greetings & Introductions', desc: 'Learn basic Swahili greetings', words: [
          { q: 'How do you say "Hello"?', a: 'Hujambo' }, { q: 'How do you say "Goodbye"?', a: 'Kwaheri' },
          { q: 'How do you say "Good morning"?', a: 'Habari za asubuhi' }, { q: 'How do you say "Good night"?', a: 'Lala salama' },
          { q: 'How do you say "Thank you"?', a: 'Asante' }, { q: 'How do you say "Welcome"?', a: 'Karibu' },
        ]},
        { title: 'Food & Drinks', desc: 'Common Swahili food vocabulary', words: [
          { q: 'How do you say "Water"?', a: 'Maji' }, { q: 'How do you say "Food"?', a: 'Chakula' },
          { q: 'How do you say "Rice"?', a: 'Wali' }, { q: 'How do you say "Meat"?', a: 'Nyama' },
          { q: 'How do you say "Fish"?', a: 'Samaki' }, { q: 'How do you say "Tea"?', a: 'Chai' },
        ]},
        { title: 'Numbers 1-10', desc: 'Learn Swahili numbers', words: [
          { q: 'How do you say "One"?', a: 'Moja' }, { q: 'How do you say "Two"?', a: 'Mbili' },
          { q: 'How do you say "Three"?', a: 'Tatu' }, { q: 'How do you say "Five"?', a: 'Tano' },
          { q: 'How do you say "Seven"?', a: 'Saba' }, { q: 'How do you say "Ten"?', a: 'Kumi' },
        ]},
        { title: 'Colors', desc: 'Learn Swahili color names', words: [
          { q: 'How do you say "Red"?', a: 'Nyekundu' }, { q: 'How do you say "Blue"?', a: 'Bluu' },
          { q: 'How do you say "Green"?', a: 'Kijani' }, { q: 'How do you say "Yellow"?', a: 'Njano' },
          { q: 'How do you say "Black"?', a: 'Nyeusi' }, { q: 'How do you say "White"?', a: 'Nyeupe' },
        ]},
        { title: 'Family Members', desc: 'Swahili family vocabulary', words: [
          { q: 'How do you say "Mother"?', a: 'Mama' }, { q: 'How do you say "Father"?', a: 'Baba' },
          { q: 'How do you say "Child"?', a: 'Mtoto' }, { q: 'How do you say "Brother"?', a: 'Kaka' },
          { q: 'How do you say "Sister"?', a: 'Dada' }, { q: 'How do you say "Family"?', a: 'Familia' },
        ]},
        { title: 'Animals', desc: 'Swahili animal names', words: [
          { q: 'How do you say "Dog"?', a: 'Mbwa' }, { q: 'How do you say "Cat"?', a: 'Paka' },
          { q: 'How do you say "Bird"?', a: 'Ndege' }, { q: 'How do you say "Fish"?', a: 'Samaki' },
          { q: 'How do you say "Lion"?', a: 'Simba' }, { q: 'How do you say "Elephant"?', a: 'Tembo' },
        ]},
        { title: 'Weather', desc: 'Swahili weather terms', words: [
          { q: 'How do you say "Sun"?', a: 'Jua' }, { q: 'How do you say "Rain"?', a: 'Mvua' },
          { q: 'How do you say "Hot"?', a: 'Moto' }, { q: 'How do you say "Cold"?', a: 'Baridi' },
          { q: 'How do you say "Wind"?', a: 'Upepo' }, { q: 'How do you say "Cloud"?', a: 'Wingu' },
        ]},
        { title: 'Clothing', desc: 'Swahili clothing vocabulary', words: [
          { q: 'How do you say "Clothes"?', a: 'Nguo' }, { q: 'How do you say "Shirt"?', a: 'Shati' },
          { q: 'How do you say "Shoes"?', a: 'Viatu' }, { q: 'How do you say "Hat"?', a: 'Kofia' },
          { q: 'How do you say "Pants"?', a: 'Suruali' }, { q: 'How do you say "Dress"?', a: 'Gauni' },
        ]},
        { title: 'Body Parts', desc: 'Swahili body part names', words: [
          { q: 'How do you say "Head"?', a: 'Kichwa' }, { q: 'How do you say "Hand"?', a: 'Mkono' },
          { q: 'How do you say "Eye"?', a: 'Jicho' }, { q: 'How do you say "Heart"?', a: 'Moyo' },
          { q: 'How do you say "Foot"?', a: 'Mguu' }, { q: 'How do you say "Mouth"?', a: 'Mdomo' },
        ]},
        { title: 'Emotions', desc: 'Swahili emotion words', words: [
          { q: 'How do you say "Happy"?', a: 'Furaha' }, { q: 'How do you say "Sad"?', a: 'Huzuni' },
          { q: 'How do you say "Angry"?', a: 'Hasira' }, { q: 'How do you say "Scared"?', a: 'Woga' },
          { q: 'How do you say "Love"?', a: 'Upendo' }, { q: 'How do you say "Peace"?', a: 'Amani' },
        ]},
      )
      break
  }

  // Build vocabulary lesson exercises
  for (const vl of vocabLessons) {
    const level = orderIdx < 5 ? 1 : 2
    const exercises: LessonSeed['exercises'] = []

    vl.words.forEach((w, i) => {
      const exerciseType = i % 4 === 0 ? 'listening' : i % 4 === 1 ? 'translation' : i % 4 === 2 ? 'fill_blank' : 'matching'
      // Generate distractors based on target language
      const allAnswers = vl.words.map(x => x.a)
      const distractors = allAnswers.filter(a => a !== w.a).sort(() => Math.random() - 0.5).slice(0, 3)

      if (exerciseType === 'listening') {
        exercises.push({
          type: 'listening',
          question: `Listen and select the correct word for "${w.q.replace('How do you say ', '').replace('?', '').replace('"', '')}"`,
          correctAnswer: w.a,
          options: [w.a, ...distractors].sort(() => Math.random() - 0.5),
        })
      } else if (exerciseType === 'translation') {
        exercises.push({
          type: 'translation',
          question: w.q,
          correctAnswer: w.a,
          options: [w.a, ...distractors].sort(() => Math.random() - 0.5),
        })
      } else if (exerciseType === 'fill_blank') {
        exercises.push({
          type: 'fill_blank',
          question: `The ${targetLang} word for "${w.q.replace('How do you say "', '').replace('"?', '')}" is ___`,
          correctAnswer: w.a,
          options: [w.a, ...distractors].sort(() => Math.random() - 0.5),
          hint: `It starts with "${w.a.charAt(0)}"`,
        })
      } else {
        // matching - use word1:translation1 format
        const otherWord = vl.words[(i + 1) % vl.words.length]
        exercises.push({
          type: 'matching',
          question: 'Match the word with its translation',
          correctAnswer: `${w.a}:${w.q.replace('How do you say ', '').replace('?', '').replace(/"/g, '')}`,
          options: [
            `${w.a}:${w.q.replace('How do you say ', '').replace('?', '').replace(/"/g, '')}`,
            `${otherWord.a}:${otherWord.q.replace('How do you say ', '').replace('?', '').replace(/"/g, '')}`,
            `${distractors[0]}:Wrong`,
            `${distractors[1]}:Wrong`,
          ].sort(() => Math.random() - 0.5),
        })
      }
    })

    // Pick 5-6 exercises
    const selectedExercises = exercises.slice(0, 6)

    lessons.push({
      title: vl.title,
      description: vl.desc,
      category: 'vocabulary',
      level,
      orderIndex: orderIdx++,
      xpReward: 10,
      exercises: selectedExercises,
    })
  }

  // Phrases lessons (15xp each) - Levels 1-2
  const phraseLessons: Array<{ title: string; desc: string; phrases: Array<{ q: string; a: string }> }> = []

  switch (targetLang) {
    case 'Spanish':
      phraseLessons.push(
        { title: 'Common Expressions', desc: 'Everyday Spanish expressions', phrases: [
          { q: 'How are you?', a: '¿Cómo estás?' }, { q: 'I am fine', a: 'Estoy bien' },
          { q: 'What is your name?', a: '¿Cómo te llamas?' }, { q: 'My name is...', a: 'Me llamo...' },
          { q: 'Nice to meet you', a: 'Mucho gusto' }, { q: 'I do not understand', a: 'No entiendo' },
        ]},
        { title: 'Asking Directions', desc: 'Spanish phrases for navigation', phrases: [
          { q: 'Where is the bathroom?', a: '¿Dónde está el baño?' }, { q: 'Turn left', a: 'Gira a la izquierda' },
          { q: 'Turn right', a: 'Gira a la derecha' }, { q: 'Go straight', a: 'Sigue recto' },
          { q: 'It is near', a: 'Está cerca' }, { q: 'It is far', a: 'Está lejos' },
        ]},
        { title: 'At the Restaurant', desc: 'Spanish phrases for dining', phrases: [
          { q: 'A table for two, please', a: 'Una mesa para dos, por favor' }, { q: 'The menu, please', a: 'El menú, por favor' },
          { q: 'I would like...', a: 'Me gustaría...' }, { q: 'The check, please', a: 'La cuenta, por favor' },
          { q: 'It was delicious', a: 'Estaba delicioso' }, { q: 'Water, please', a: 'Agua, por favor' },
        ]},
        { title: 'Shopping', desc: 'Spanish phrases for shopping', phrases: [
          { q: 'How much does it cost?', a: '¿Cuánto cuesta?' }, { q: 'It is too expensive', a: 'Es muy caro' },
          { q: 'Can I try it on?', a: '¿Puedo probármelo?' }, { q: 'I will take it', a: 'Lo llevaré' },
          { q: 'Do you have a smaller size?', a: '¿Tiene una talla más pequeña?' }, { q: 'I am just looking', a: 'Solo estoy mirando' },
        ]},
      )
      break
    case 'French':
      phraseLessons.push(
        { title: 'Common Expressions', desc: 'Everyday French expressions', phrases: [
          { q: 'How are you?', a: 'Comment allez-vous?' }, { q: 'I am fine', a: 'Je vais bien' },
          { q: 'What is your name?', a: 'Comment vous appelez-vous?' }, { q: 'My name is...', a: 'Je m\'appelle...' },
          { q: 'Nice to meet you', a: 'Enchanté(e)' }, { q: 'I do not understand', a: 'Je ne comprends pas' },
        ]},
        { title: 'Asking Directions', desc: 'French phrases for navigation', phrases: [
          { q: 'Where is the bathroom?', a: 'Où sont les toilettes?' }, { q: 'Turn left', a: 'Tournez à gauche' },
          { q: 'Turn right', a: 'Tournez à droite' }, { q: 'Go straight', a: 'Allez tout droit' },
          { q: 'It is near', a: 'C\'est proche' }, { q: 'It is far', a: 'C\'est loin' },
        ]},
        { title: 'At the Restaurant', desc: 'French phrases for dining', phrases: [
          { q: 'A table for two, please', a: 'Une table pour deux, s\'il vous plaît' }, { q: 'The menu, please', a: 'Le menu, s\'il vous plaît' },
          { q: 'I would like...', a: 'Je voudrais...' }, { q: 'The check, please', a: 'L\'addition, s\'il vous plaît' },
          { q: 'It was delicious', a: 'C\'était délicieux' }, { q: 'Water, please', a: 'De l\'eau, s\'il vous plaît' },
        ]},
        { title: 'Shopping', desc: 'French phrases for shopping', phrases: [
          { q: 'How much does it cost?', a: 'Combien ça coûte?' }, { q: 'It is too expensive', a: 'C\'est trop cher' },
          { q: 'Can I try it on?', a: 'Puis-je l\'essayer?' }, { q: 'I will take it', a: 'Je le prends' },
          { q: 'Do you have a smaller size?', a: 'Avez-vous une taille plus petite?' }, { q: 'I am just looking', a: 'Je regarde juste' },
        ]},
      )
      break
    case 'German':
      phraseLessons.push(
        { title: 'Common Expressions', desc: 'Everyday German expressions', phrases: [
          { q: 'How are you?', a: 'Wie geht es Ihnen?' }, { q: 'I am fine', a: 'Mir geht es gut' },
          { q: 'What is your name?', a: 'Wie heißen Sie?' }, { q: 'My name is...', a: 'Ich heiße...' },
          { q: 'Nice to meet you', a: 'Freut mich' }, { q: 'I do not understand', a: 'Ich verstehe nicht' },
        ]},
        { title: 'Asking Directions', desc: 'German phrases for navigation', phrases: [
          { q: 'Where is the bathroom?', a: 'Wo ist die Toilette?' }, { q: 'Turn left', a: 'Biegen Sie links ab' },
          { q: 'Turn right', a: 'Biegen Sie rechts ab' }, { q: 'Go straight', a: 'Gehen Sie geradeaus' },
          { q: 'It is near', a: 'Es ist in der Nähe' }, { q: 'It is far', a: 'Es ist weit entfernt' },
        ]},
        { title: 'At the Restaurant', desc: 'German phrases for dining', phrases: [
          { q: 'A table for two, please', a: 'Einen Tisch für zwei, bitte' }, { q: 'The menu, please', a: 'Die Speisekarte, bitte' },
          { q: 'I would like...', a: 'Ich möchte...' }, { q: 'The check, please', a: 'Die Rechnung, bitte' },
          { q: 'It was delicious', a: 'Es war köstlich' }, { q: 'Water, please', a: 'Wasser, bitte' },
        ]},
        { title: 'Shopping', desc: 'German phrases for shopping', phrases: [
          { q: 'How much does it cost?', a: 'Wie viel kostet das?' }, { q: 'It is too expensive', a: 'Es ist zu teuer' },
          { q: 'Can I try it on?', a: 'Kann ich es anprobieren?' }, { q: 'I will take it', a: 'Ich nehme es' },
          { q: 'Do you have a smaller size?', a: 'Haben Sie eine kleinere Größe?' }, { q: 'I am just looking', a: 'Ich schaue mich nur um' },
        ]},
      )
      break
    case 'Chinese':
      phraseLessons.push(
        { title: 'Common Expressions', desc: 'Everyday Chinese expressions', phrases: [
          { q: 'How are you?', a: '你好吗？' }, { q: 'I am fine', a: '我很好' },
          { q: 'What is your name?', a: '你叫什么名字？' }, { q: 'My name is...', a: '我叫...' },
          { q: 'Nice to meet you', a: '很高兴认识你' }, { q: 'I do not understand', a: '我不明白' },
        ]},
        { title: 'Asking Directions', desc: 'Chinese phrases for navigation', phrases: [
          { q: 'Where is the bathroom?', a: '洗手间在哪里？' }, { q: 'Turn left', a: '左转' },
          { q: 'Turn right', a: '右转' }, { q: 'Go straight', a: '一直走' },
          { q: 'It is near', a: '很近' }, { q: 'It is far', a: '很远' },
        ]},
        { title: 'At the Restaurant', desc: 'Chinese phrases for dining', phrases: [
          { q: 'A table for two, please', a: '请给我两人的桌子' }, { q: 'The menu, please', a: '请给我菜单' },
          { q: 'I would like...', a: '我想要...' }, { q: 'The check, please', a: '请结账' },
          { q: 'It was delicious', a: '很好吃' }, { q: 'Water, please', a: '请给我水' },
        ]},
        { title: 'Shopping', desc: 'Chinese phrases for shopping', phrases: [
          { q: 'How much does it cost?', a: '多少钱？' }, { q: 'It is too expensive', a: '太贵了' },
          { q: 'Can I try it on?', a: '我能试穿吗？' }, { q: 'I will take it', a: '我要买这个' },
          { q: 'Do you have a smaller size?', a: '有小一点的吗？' }, { q: 'I am just looking', a: '我只是看看' },
        ]},
      )
      break
    case 'Arabic':
      phraseLessons.push(
        { title: 'Common Expressions', desc: 'Everyday Arabic expressions', phrases: [
          { q: 'How are you?', a: 'كيف حالك؟' }, { q: 'I am fine', a: 'أنا بخير' },
          { q: 'What is your name?', a: 'ما اسمك؟' }, { q: 'My name is...', a: 'اسمي...' },
          { q: 'Nice to meet you', a: 'سررت بلقائك' }, { q: 'I do not understand', a: 'لا أفهم' },
        ]},
        { title: 'Asking Directions', desc: 'Arabic phrases for navigation', phrases: [
          { q: 'Where is the bathroom?', a: 'أين الحمام؟' }, { q: 'Turn left', a: 'استدر يسارا' },
          { q: 'Turn right', a: 'استدر يمينا' }, { q: 'Go straight', a: 'اذهب straight' },
          { q: 'It is near', a: 'إنه قريب' }, { q: 'It is far', a: 'إنه بعيد' },
        ]},
        { title: 'At the Restaurant', desc: 'Arabic phrases for dining', phrases: [
          { q: 'A table for two, please', a: 'طاولة لشخصين من فضلك' }, { q: 'The menu, please', a: 'القائمة من فضلك' },
          { q: 'I would like...', a: 'أريد...' }, { q: 'The check, please', a: 'الفاتورة من فضلك' },
          { q: 'It was delicious', a: 'كان لذيذا' }, { q: 'Water, please', a: 'ماء من فضلك' },
        ]},
        { title: 'Shopping', desc: 'Arabic phrases for shopping', phrases: [
          { q: 'How much does it cost?', a: 'بكم هذا؟' }, { q: 'It is too expensive', a: 'إنه غالي جدا' },
          { q: 'Can I try it on?', a: 'هل يمكنني تجربته؟' }, { q: 'I will take it', a: 'سآخذه' },
          { q: 'Do you have a smaller size?', a: 'هل لديك مقاس أصغر؟' }, { q: 'I am just looking', a: 'أنا فقط أتفرج' },
        ]},
      )
      break
    case 'Yoruba':
      phraseLessons.push(
        { title: 'Common Expressions', desc: 'Everyday Yoruba expressions', phrases: [
          { q: 'How are you?', a: 'Ṣe daadaa ni?' }, { q: 'I am fine', a: 'Mo daadaa ni' },
          { q: 'What is your name?', a: 'Kíni orúkọ rẹ?' }, { q: 'My name is...', a: 'Orúkọ mi ni...' },
          { q: 'Nice to meet you', a: 'Ayọ̀ ni láti pàdé ẹ' }, { q: 'I do not understand', a: 'N kò gbó' },
        ]},
        { title: 'Asking Directions', desc: 'Yoruba phrases for navigation', phrases: [
          { q: 'Where is the bathroom?', a: 'Ile-ikọkọ nibo?' }, { q: 'Turn left', a: 'Pade si osi' },
          { q: 'Turn right', a: 'Pade si otun' }, { q: 'Go straight', a: 'Lo tán' },
          { q: 'It is near', a: 'O sunmọ' }, { q: 'It is far', a: 'O jìnna' },
        ]},
        { title: 'At the Restaurant', desc: 'Yoruba phrases for dining', phrases: [
          { q: 'A table for two, please', a: 'Tabili fun meji, jọwọ' }, { q: 'The menu, please', a: 'Akojọ ounjẹ, jọwọ' },
          { q: 'I would like...', a: 'Mo fẹ́...' }, { q: 'The check, please', a: 'Iṣiro owo, jọwọ' },
          { q: 'It was delicious', a: 'O dun ọ̀rẹ̀' }, { q: 'Water, please', a: 'Omi, jọwọ' },
        ]},
        { title: 'Shopping', desc: 'Yoruba phrases for shopping', phrases: [
          { q: 'How much does it cost?', a: 'Elo ni eyi?' }, { q: 'It is too expensive', a: 'O ga ju' },
          { q: 'I will take it', a: 'Mo mu e' }, { q: 'Do you have...?', a: 'Nwọ ni...' },
          { q: 'I am just looking', a: 'Mo n wo nikan soso' }, { q: 'Can you reduce the price?', a: 'Se o le fi owo kekere?' },
        ]},
      )
      break
    case 'Hindi':
      phraseLessons.push(
        { title: 'Common Expressions', desc: 'Everyday Hindi expressions', phrases: [
          { q: 'How are you?', a: 'आप कैसे हैं?' }, { q: 'I am fine', a: 'मैं ठीक हूँ' },
          { q: 'What is your name?', a: 'आपका नाम क्या है?' }, { q: 'My name is...', a: 'मेरा नाम... है' },
          { q: 'Nice to meet you', a: 'आपसे मिलकर खुशी हुई' }, { q: 'I do not understand', a: 'मुझे समझ नहीं आया' },
        ]},
        { title: 'Asking Directions', desc: 'Hindi phrases for navigation', phrases: [
          { q: 'Where is the bathroom?', a: 'बाथरूम कहाँ है?' }, { q: 'Turn left', a: 'बाईं ओर मुड़ें' },
          { q: 'Turn right', a: 'दाईं ओर मुड़ें' }, { q: 'Go straight', a: 'सीधे जाएं' },
          { q: 'It is near', a: 'यह पास है' }, { q: 'It is far', a: 'यह दूर है' },
        ]},
        { title: 'At the Restaurant', desc: 'Hindi phrases for dining', phrases: [
          { q: 'A table for two, please', a: 'कृपया दो के लिए टेबल' }, { q: 'The menu, please', a: 'कृपया मेनू' },
          { q: 'I would like...', a: 'मुझे... चाहिए' }, { q: 'The check, please', a: 'कृपया बिल' },
          { q: 'It was delicious', a: 'बहुत स्वादिष्ट था' }, { q: 'Water, please', a: 'कृपया पानी' },
        ]},
        { title: 'Shopping', desc: 'Hindi phrases for shopping', phrases: [
          { q: 'How much does it cost?', a: 'यह कितने का है?' }, { q: 'It is too expensive', a: 'यह बहुत महंगा है' },
          { q: 'Can I try it on?', a: 'क्या मैं इसे पहन कर देख सकता हूँ?' }, { q: 'I will take it', a: 'मैं यह ले लूँगा' },
          { q: 'Do you have a smaller size?', a: 'क्या आपके पास छोटा साइज़ है?' }, { q: 'I am just looking', a: 'मैं बस देख रहा हूँ' },
        ]},
      )
      break
    case 'Swahili':
      phraseLessons.push(
        { title: 'Common Expressions', desc: 'Everyday Swahili expressions', phrases: [
          { q: 'How are you?', a: 'Habari yako?' }, { q: 'I am fine', a: 'Mzuri sana' },
          { q: 'What is your name?', a: 'Jina lako nani?' }, { q: 'My name is...', a: 'Jina langu ni...' },
          { q: 'Nice to meet you', a: 'Nafurahi kukuona' }, { q: 'I do not understand', a: 'Sielewi' },
        ]},
        { title: 'Asking Directions', desc: 'Swahili phrases for navigation', phrases: [
          { q: 'Where is the bathroom?', a: 'Choo kiko wapi?' }, { q: 'Turn left', a: 'Geuka kushoto' },
          { q: 'Turn right', a: 'Geuka kulia' }, { q: 'Go straight', a: 'Enda moja kwa moja' },
          { q: 'It is near', a: 'Ni karibu' }, { q: 'It is far', a: 'Ni mbali' },
        ]},
        { title: 'At the Restaurant', desc: 'Swahili phrases for dining', phrases: [
          { q: 'A table for two, please', a: 'Meza ya watu wawili, tafadhali' }, { q: 'The menu, please', a: 'Menyu, tafadhali' },
          { q: 'I would like...', a: 'Ningependa...' }, { q: 'The check, please', a: 'Bili, tafadhali' },
          { q: 'It was delicious', a: 'Ilikuwa tamu sana' }, { q: 'Water, please', a: 'Maji, tafadhali' },
        ]},
        { title: 'Shopping', desc: 'Swahili phrases for shopping', phrases: [
          { q: 'How much does it cost?', a: 'Pesa ngapi?' }, { q: 'It is too expensive', a: 'Ni ghali sana' },
          { q: 'Can I try it on?', a: 'Ninaweza kujaribu?' }, { q: 'I will take it', a: 'Ninachukua' },
          { q: 'Do you have a smaller size?', a: 'Una saizi ndogo?' }, { q: 'I am just looking', a: 'Nanachanganya tu' },
        ]},
      )
      break
  }

  for (const pl of phraseLessons) {
    const level = orderIdx < 12 ? 1 : 2
    const exercises: LessonSeed['exercises'] = []

    pl.phrases.forEach((p, i) => {
      const exerciseType = i % 4 === 0 ? 'listening' : i % 4 === 1 ? 'translation' : i % 4 === 2 ? 'fill_blank' : 'matching'
      const allAnswers = pl.phrases.map(x => x.a)
      const distractors = allAnswers.filter(a => a !== p.a).sort(() => Math.random() - 0.5).slice(0, 3)

      if (exerciseType === 'listening') {
        exercises.push({
          type: 'listening',
          question: `Listen and select the correct response for "${p.q}"`,
          correctAnswer: p.a,
          options: [p.a, ...distractors].sort(() => Math.random() - 0.5),
        })
      } else if (exerciseType === 'translation') {
        exercises.push({
          type: 'translation',
          question: `Translate: "${p.q}"`,
          correctAnswer: p.a,
          options: [p.a, ...distractors].sort(() => Math.random() - 0.5),
        })
      } else if (exerciseType === 'fill_blank') {
        exercises.push({
          type: 'fill_blank',
          question: `Complete: In ${targetLang}, "${p.q}" = ___`,
          correctAnswer: p.a,
          options: [p.a, ...distractors].sort(() => Math.random() - 0.5),
          hint: `It starts with "${p.a.charAt(0)}"`,
        })
      } else {
        const otherPhrase = pl.phrases[(i + 1) % pl.phrases.length]
        exercises.push({
          type: 'matching',
          question: 'Match the phrase with its translation',
          correctAnswer: `${p.q.replace(/"/g, '')}:${p.a}`,
          options: [
            `${p.q.replace(/"/g, '')}:${p.a}`,
            `${otherPhrase.q.replace(/"/g, '')}:${otherPhrase.a}`,
            `${distractors[0]}:Wrong`,
            `${distractors[1]}:Wrong`,
          ].sort(() => Math.random() - 0.5),
        })
      }
    })

    lessons.push({
      title: pl.title,
      description: pl.desc,
      category: 'phrases',
      level,
      orderIndex: orderIdx++,
      xpReward: 15,
      exercises: exercises.slice(0, 6),
    })
  }

  // Grammar lessons (20xp each) - Levels 2-3
  const grammarLessons: Array<{ title: string; desc: string; exercises: Array<{ type: string; question: string; correctAnswer: string; options: string[]; hint?: string }> }> = []

  switch (targetLang) {
    case 'Spanish':
      grammarLessons.push(
        { title: 'Basic Sentence Structure', desc: 'Spanish word order fundamentals', exercises: [
          { type: 'fill_blank', question: '___ soy estudiante. (I am a student)', correctAnswer: 'Yo', options: ['Yo', 'Tú', 'Él', 'Ella'], hint: 'First person pronoun' },
          { type: 'translation', question: 'Translate: "The cat eats fish"', correctAnswer: 'El gato come pescado', options: ['El gato come pescado', 'El perro come carne', 'La gata come pescado', 'El gato bebe agua'] },
          { type: 'fill_blank', question: 'Ella ___ una casa grande. (has)', correctAnswer: 'tiene', options: ['tiene', 'es', 'está', 'come'], hint: 'Verb for "to have"' },
          { type: 'listening', question: 'Select the correct sentence structure: Subject + Verb + Object', correctAnswer: 'Yo como comida', options: ['Yo como comida', 'Comida yo como', 'Como yo comida', 'Comida como yo'] },
          { type: 'matching', question: 'Match subject pronouns with their conjugations', correctAnswer: 'Yo:hablo', options: ['Yo:hablo', 'Tú:hablas', 'Él:habla', 'Ella:habla'] },
          { type: 'fill_blank', question: 'Nosotros ___ españoles. (are)', correctAnswer: 'somos', options: ['somos', 'son', 'están', 'es'], hint: 'We are = Nosotros ___' },
        ]},
        { title: 'Articles & Gender', desc: 'Spanish definite and indefinite articles', exercises: [
          { type: 'fill_blank', question: '___ casa es grande. (The house)', correctAnswer: 'La', options: ['La', 'El', 'Los', 'Las'], hint: 'Feminine singular article' },
          { type: 'fill_blank', question: '___ libro es interesante. (The book)', correctAnswer: 'El', options: ['El', 'La', 'Un', 'Una'], hint: 'Masculine singular article' },
          { type: 'translation', question: 'Translate: "A dog"', correctAnswer: 'Un perro', options: ['Un perro', 'El perro', 'Una perro', 'Los perros'] },
          { type: 'listening', question: 'Select the feminine plural article for "the"', correctAnswer: 'Las', options: ['Las', 'Los', 'Unas', 'Unos'] },
          { type: 'matching', question: 'Match nouns with their gender', correctAnswer: 'mesa:feminine', options: ['mesa:feminine', 'libro:masculine', 'casa:feminine', 'perro:masculine'] },
          { type: 'fill_blank', question: '___ niños juegan. (The children)', correctAnswer: 'Los', options: ['Los', 'Las', 'Unos', 'Unas'], hint: 'Masculine plural article' },
        ]},
        { title: 'Verb Conjugation Basics', desc: 'Present tense conjugation patterns', exercises: [
          { type: 'fill_blank', question: 'Yo ___ (hablar) español.', correctAnswer: 'hablo', options: ['hablo', 'hablas', 'habla', 'hablan'], hint: 'First person singular of hablar' },
          { type: 'fill_blank', question: 'Tú ___ (comer) mucho.', correctAnswer: 'comes', options: ['comes', 'come', 'comemos', 'comen'], hint: 'Second person singular of comer' },
          { type: 'translation', question: 'Conjugate "vivir" for "ellos":', correctAnswer: 'viven', options: ['viven', 'vive', 'vivimos', 'vivís'] },
          { type: 'listening', question: 'Which is the correct conjugation for "nosotros bebemos"?', correctAnswer: 'bebemos', options: ['bebemos', 'bebo', 'bebes', 'beben'] },
          { type: 'matching', question: 'Match verbs with correct yo-forms', correctAnswer: 'hablar:hablo', options: ['hablar:hablo', 'comer:como', 'vivir:vivo', 'beber:bebo'] },
          { type: 'fill_blank', question: 'Él ___ (vivir) en Madrid.', correctAnswer: 'vive', options: ['vive', 'vives', 'vivimos', 'viven'], hint: 'Third person singular of vivir' },
        ]},
        { title: 'Tenses', desc: 'Past and future tense basics', exercises: [
          { type: 'fill_blank', question: 'Ayer yo ___ (comer) pizza. (ate)', correctAnswer: 'comí', options: ['comí', 'como', 'comeré', 'comía'], hint: 'Preterite first person singular' },
          { type: 'fill_blank', question: 'Mañana ___ (ir) al cine. (will go)', correctAnswer: 'iré', options: ['iré', 'voy', 'iba', 'fui'], hint: 'Future first person singular of ir' },
          { type: 'translation', question: 'Translate: "I was happy"', correctAnswer: 'Yo era feliz', options: ['Yo era feliz', 'Yo fui feliz', 'Yo estoy feliz', 'Yo seré feliz'] },
          { type: 'listening', question: 'Which form expresses a past completed action?', correctAnswer: 'hablé', options: ['hablé', 'hablo', 'hablaré', 'hablaba'] },
          { type: 'matching', question: 'Match tenses with their usage', correctAnswer: 'comí:past completed', options: ['comí:past completed', 'comía:past ongoing', 'comeré:future', 'como:present'] },
          { type: 'fill_blank', question: 'Cuando era niño, ___ (jugar) al fútbol. (used to play)', correctAnswer: 'jugaba', options: ['jugaba', 'jugué', 'jugaré', 'juego'], hint: 'Imperfect tense for habitual past' },
        ]},
      )
      break
    case 'French':
      grammarLessons.push(
        { title: 'Basic Sentence Structure', desc: 'French word order fundamentals', exercises: [
          { type: 'fill_blank', question: '___ suis étudiant. (I am a student)', correctAnswer: 'Je', options: ['Je', 'Tu', 'Il', 'Elle'], hint: 'First person pronoun' },
          { type: 'translation', question: 'Translate: "The cat eats fish"', correctAnswer: 'Le chat mange du poisson', options: ['Le chat mange du poisson', 'Le chien mange de la viande', 'La chatte mange du poisson', 'Le chat boit de l\'eau'] },
          { type: 'fill_blank', question: 'Elle ___ une grande maison. (has)', correctAnswer: 'a', options: ['a', 'est', 'sont', 'mange'], hint: 'Verb avoir (to have)' },
          { type: 'listening', question: 'Select the correct sentence: Subject + Verb + Object', correctAnswer: 'Je mange de la nourriture', options: ['Je mange de la nourriture', 'Nourriture je mange', 'Mange je nourriture', 'Nourriture mange je'] },
          { type: 'matching', question: 'Match pronouns with être conjugation', correctAnswer: 'Je:suis', options: ['Je:suis', 'Tu:es', 'Il:est', 'Elle:est'] },
          { type: 'fill_blank', question: 'Nous ___ français. (are)', correctAnswer: 'sommes', options: ['sommes', 'sont', 'êtes', 'es'], hint: 'Nous ___ français' },
        ]},
        { title: 'Articles & Gender', desc: 'French definite and indefinite articles', exercises: [
          { type: 'fill_blank', question: '___ maison est grande. (The house)', correctAnswer: 'La', options: ['La', 'Le', 'Les', 'Un'], hint: 'Feminine singular' },
          { type: 'fill_blank', question: '___ livre est intéressant. (The book)', correctAnswer: 'Le', options: ['Le', 'La', 'Un', 'Une'], hint: 'Masculine singular' },
          { type: 'translation', question: 'Translate: "A cat"', correctAnswer: 'Un chat', options: ['Un chat', 'Le chat', 'Une chat', 'Les chats'] },
          { type: 'listening', question: 'Select the feminine plural article for "the"', correctAnswer: 'Les', options: ['Les', 'Le', 'La', 'Des'] },
          { type: 'matching', question: 'Match nouns with their gender', correctAnswer: 'table:feminine', options: ['table:feminine', 'livre:masculine', 'maison:feminine', 'chat:masculine'] },
          { type: 'fill_blank', question: '___ enfants jouent. (The children)', correctAnswer: 'Les', options: ['Les', 'Le', 'La', 'Des'], hint: 'Plural article' },
        ]},
        { title: 'Verb Conjugation Basics', desc: 'Present tense conjugation patterns', exercises: [
          { type: 'fill_blank', question: 'Je ___ (parler) français.', correctAnswer: 'parle', options: ['parle', 'parles', 'parle', 'parlons'], hint: 'First person of parler' },
          { type: 'fill_blank', question: 'Tu ___ (manger) beaucoup.', correctAnswer: 'manges', options: ['manges', 'mange', 'mangeons', 'mangez'], hint: 'Second person of manger' },
          { type: 'translation', question: 'Conjugate "vivre" for "ils":', correctAnswer: 'vivent', options: ['vivent', 'vit', 'vivons', 'vivez'] },
          { type: 'listening', question: 'Which is correct for "nous buvons"?', correctAnswer: 'buvons', options: ['buvons', 'bois', 'boit', 'boivent'] },
          { type: 'matching', question: 'Match verbs with je-forms', correctAnswer: 'parler:parle', options: ['parler:parle', 'manger:mange', 'vivre:vit', 'boire:bois'] },
          { type: 'fill_blank', question: 'Il ___ (habiter) à Paris.', correctAnswer: 'habite', options: ['habite', 'habites', 'habitons', 'habitent'], hint: 'Third person of habiter' },
        ]},
        { title: 'Tenses', desc: 'Past and future tense basics', exercises: [
          { type: 'fill_blank', question: 'Hier, j\'___ (manger) une pomme. (ate)', correctAnswer: 'ai mangé', options: ['ai mangé', 'mange', 'mangerai', 'mangeais'], hint: 'Passé composé' },
          { type: 'fill_blank', question: 'Demain, je ___ (aller) au cinéma.', correctAnswer: 'irai', options: ['irai', 'vais', 'allais', 'suis allé'], hint: 'Future tense' },
          { type: 'translation', question: 'Translate: "I was happy"', correctAnswer: 'J\'étais heureux', options: ['J\'étais heureux', 'J\'ai été heureux', 'Je suis heureux', 'Je serai heureux'] },
          { type: 'listening', question: 'Which form expresses a completed past action?', correctAnswer: 'ai parlé', options: ['ai parlé', 'parle', 'parlerai', 'parlais'] },
          { type: 'matching', question: 'Match tenses with usage', correctAnswer: 'ai mangé:past completed', options: ['ai mangé:past completed', 'mangeais:past ongoing', 'mangerai:future', 'mange:present'] },
          { type: 'fill_blank', question: 'Quand j\'étais enfant, je ___ (jouer) au foot. (used to play)', correctAnswer: 'jouais', options: ['jouais', 'ai joué', 'jouerai', 'joue'], hint: 'Imparfait tense' },
        ]},
      )
      break
    case 'German':
      grammarLessons.push(
        { title: 'Basic Sentence Structure', desc: 'German word order fundamentals', exercises: [
          { type: 'fill_blank', question: '___ bin Student. (I am a student)', correctAnswer: 'Ich', options: ['Ich', 'Du', 'Er', 'Sie'], hint: 'First person pronoun' },
          { type: 'translation', question: 'Translate: "The cat eats fish"', correctAnswer: 'Die Katze isst Fisch', options: ['Die Katze isst Fisch', 'Der Hund isst Fleisch', 'Die Katze trinkt Wasser', 'Der Hund isst Fisch'] },
          { type: 'fill_blank', question: 'Sie ___ ein großes Haus. (has)', correctAnswer: 'hat', options: ['hat', 'ist', 'sind', 'hat'], hint: 'Verb haben' },
          { type: 'listening', question: 'Select the correct German sentence order', correctAnswer: 'Ich esse Essen', options: ['Ich esse Essen', 'Essen ich esse', 'Esse ich Essen', 'Essen esse ich'] },
          { type: 'matching', question: 'Match pronouns with sein conjugation', correctAnswer: 'Ich:bin', options: ['Ich:bin', 'Du:bist', 'Er:ist', 'Sie:ist'] },
          { type: 'fill_blank', question: 'Wir ___ Deutsche. (are)', correctAnswer: 'sind', options: ['sind', 'sein', 'seid', 'ist'], hint: 'Wir ___' },
        ]},
        { title: 'Articles & Gender', desc: 'German definite and indefinite articles', exercises: [
          { type: 'fill_blank', question: '___ Haus ist groß. (The house)', correctAnswer: 'Das', options: ['Das', 'Der', 'Die', 'Den'], hint: 'Neuter article' },
          { type: 'fill_blank', question: '___ Mann ist groß. (The man)', correctAnswer: 'Der', options: ['Der', 'Das', 'Die', 'Ein'], hint: 'Masculine article' },
          { type: 'translation', question: 'Translate: "A cat"', correctAnswer: 'Eine Katze', options: ['Eine Katze', 'Der Katze', 'Ein Katze', 'Die Katze'] },
          { type: 'listening', question: 'Select the plural definite article', correctAnswer: 'Die', options: ['Die', 'Der', 'Das', 'Den'] },
          { type: 'matching', question: 'Match nouns with their gender', correctAnswer: 'Tisch:masculine', options: ['Tisch:masculine', 'Haus:neuter', 'Katze:feminine', 'Buch:neuter'] },
          { type: 'fill_blank', question: '___ Kinder spielen. (The children)', correctAnswer: 'Die', options: ['Die', 'Der', 'Das', 'Den'], hint: 'Plural article' },
        ]},
        { title: 'Verb Conjugation Basics', desc: 'Present tense conjugation patterns', exercises: [
          { type: 'fill_blank', question: 'Ich ___ (sprechen) Deutsch.', correctAnswer: 'spreche', options: ['spreche', 'sprichst', 'spricht', 'sprechen'], hint: 'Ich-form of sprechen' },
          { type: 'fill_blank', question: 'Du ___ (essen) viel.', correctAnswer: 'isst', options: ['isst', 'esse', 'esst', 'essen'], hint: 'Du-form of essen' },
          { type: 'translation', question: 'Conjugate "leben" for "sie" (they):', correctAnswer: 'leben', options: ['leben', 'lebt', 'lebst', 'lebe'] },
          { type: 'listening', question: 'Which is the wir-form of "trinken"?', correctAnswer: 'trinken', options: ['trinken', 'trinke', 'trinkt', 'trinkst'] },
          { type: 'matching', question: 'Match verbs with ich-forms', correctAnswer: 'sprechen:spreche', options: ['sprechen:spreche', 'essen:esse', 'leben:lebe', 'trinken:trinke'] },
          { type: 'fill_blank', question: 'Er ___ (wohnen) in Berlin.', correctAnswer: 'wohnt', options: ['wohnt', 'wohnst', 'wohnen', 'wohne'], hint: 'Er-form of wohnen' },
        ]},
        { title: 'Tenses', desc: 'Past and future tense basics', exercises: [
          { type: 'fill_blank', question: 'Gestern ___ ich einen Apfel. (ate)', correctAnswer: 'aß', options: ['aß', 'esse', 'werde essen', 'aß'], hint: 'Präteritum of essen' },
          { type: 'fill_blank', question: 'Morgen ___ ich ins Kino gehen.', correctAnswer: 'werde', options: ['werde', 'gehe', 'ging', 'bin gegangen'], hint: 'Future tense auxiliary' },
          { type: 'translation', question: 'Translate: "I was happy"', correctAnswer: 'Ich war glücklich', options: ['Ich war glücklich', 'Ich war gewesen glücklich', 'Ich bin glücklich', 'Ich werde glücklich'] },
          { type: 'listening', question: 'Which form expresses a completed past action?', correctAnswer: 'habe gesprochen', options: ['habe gesprochen', 'spreche', 'werde sprechen', 'sprach'] },
          { type: 'matching', question: 'Match tenses with usage', correctAnswer: 'aß:simple past', options: ['aß:simple past', 'habe gegessen:perfect', 'werde essen:future', 'esse:present'] },
          { type: 'fill_blank', question: 'Als Kind ___ ich oft Fußball gespielt.', correctAnswer: 'habe', options: ['habe', 'hatte', 'werde', 'spielt'], hint: 'Perfekt auxiliary' },
        ]},
      )
      break
    case 'Chinese':
      grammarLessons.push(
        { title: 'Basic Sentence Structure', desc: 'Chinese word order: Subject + Time + Place + Verb + Object', exercises: [
          { type: 'fill_blank', question: '___ 是学生。 (I am a student)', correctAnswer: '我', options: ['我', '你', '他', '她'], hint: 'First person pronoun' },
          { type: 'translation', question: 'Translate: "I eat rice"', correctAnswer: '我吃米饭', options: ['我吃米饭', '米饭我吃', '吃米饭我', '米饭吃我'] },
          { type: 'fill_blank', question: '她 ___ 很高。 (is)', correctAnswer: '是', options: ['是', '在', '有', '不'], hint: 'Copula verb' },
          { type: 'listening', question: 'What is the typical Chinese sentence order?', correctAnswer: 'Subject + Time + Place + Verb + Object', options: ['Subject + Time + Place + Verb + Object', 'Object + Verb + Subject', 'Verb + Subject + Object', 'Subject + Verb + Object + Time'] },
          { type: 'matching', question: 'Match pronouns with their Chinese', correctAnswer: 'I:我', options: ['I:我', 'You:你', 'He:他', 'She:她'] },
          { type: 'fill_blank', question: '我们 ___ 中国人。 (are)', correctAnswer: '是', options: ['是', '在', '有', '都'], hint: 'Copula for "we are"' },
        ]},
        { title: 'Measure Words', desc: 'Chinese measure words ( classifiers)', exercises: [
          { type: 'fill_blank', question: '一___ 人 (one person)', correctAnswer: '个', options: ['个', '只', '本', '条'], hint: 'General measure word' },
          { type: 'fill_blank', question: '两___ 书 (two books)', correctAnswer: '本', options: ['本', '个', '只', '张'], hint: 'Measure word for books' },
          { type: 'translation', question: 'Translate: "Three cats"', correctAnswer: '三只猫', options: ['三只猫', '三个猫', '三条猫', '三本猫'] },
          { type: 'listening', question: 'What measure word goes with "paper" (纸)?', correctAnswer: '张', options: ['张', '本', '个', '只'] },
          { type: 'matching', question: 'Match nouns with their measure words', correctAnswer: '人:个', options: ['人:个', '书:本', '猫:只', '纸:张'] },
          { type: 'fill_blank', question: '一___ 鱼 (one fish)', correctAnswer: '条', options: ['条', '个', '只', '本'], hint: 'Measure word for long things' },
        ]},
        { title: 'Basic Sentence Patterns', desc: 'Question formation and negation', exercises: [
          { type: 'fill_blank', question: '你 ___ 学生吗？ (Are you a student?)', correctAnswer: '是', options: ['是', '在', '有', '不'], hint: 'Question particle is 吗' },
          { type: 'fill_blank', question: '我 ___ 不喜欢吃鱼。 (do not)', correctAnswer: '不', options: ['不', '没', '很', '也'], hint: 'Negation for present' },
          { type: 'translation', question: 'Translate: "Do you like tea?"', correctAnswer: '你喜欢茶吗？', options: ['你喜欢茶吗？', '你不喜欢茶吗？', '你喜欢吗茶？', '你喜欢茶不？'] },
          { type: 'listening', question: 'How do you form a yes/no question in Chinese?', correctAnswer: 'Add 吗 at the end', options: ['Add 吗 at the end', 'Reverse word order', 'Add 是 before verb', 'Use a question word'] },
          { type: 'matching', question: 'Match negation words with usage', correctAnswer: '不:present negation', options: ['不:present negation', '没:past negation', '吗:question particle', '很:very'] },
          { type: 'fill_blank', question: '昨天我 ___ 去学校。 (did not go - past)', correctAnswer: '没', options: ['没', '不', '不没', '很'], hint: 'Past negation' },
        ]},
        { title: 'Tenses & Aspect', desc: 'Chinese aspect markers: 了, 过, 正在', exercises: [
          { type: 'fill_blank', question: '我吃___饭了。 (I have eaten)', correctAnswer: '了', options: ['了', '过', '正在', '着'], hint: 'Completion marker' },
          { type: 'fill_blank', question: '我___去中国。 (I have been to China)', correctAnswer: '过', options: ['过', '了', '正在', '着'], hint: 'Experience marker' },
          { type: 'translation', question: 'Translate: "I am eating"', correctAnswer: '我正在吃饭', options: ['我正在吃饭', '我吃饭了', '我吃过饭', '我吃着饭'] },
          { type: 'listening', question: 'Which marker indicates an action in progress?', correctAnswer: '正在', options: ['正在', '了', '过', '着'] },
          { type: 'matching', question: 'Match aspect markers with their function', correctAnswer: '了:completion', options: ['了:completion', '过:experience', '正在:progress', '着:continuing state'] },
          { type: 'fill_blank', question: '他___着书看。 (He is reading)', correctAnswer: '正', options: ['正', '了', '过', '着'], hint: 'Progressive aspect' },
        ]},
      )
      break
    case 'Arabic':
      grammarLessons.push(
        { title: 'Basic Sentence Structure', desc: 'Arabic word order: Verb-Subject-Object', exercises: [
          { type: 'fill_blank', question: '___ طالب. (I am a student)', correctAnswer: 'أنا', options: ['أنا', 'أنت', 'هو', 'هي'], hint: 'First person pronoun' },
          { type: 'translation', question: 'Translate: "The cat eats fish"', correctAnswer: 'القطة تأكل السمك', options: ['القطة تأكل السمك', 'السمك تأكله القطة', 'تأكل القطة السمك', 'القطة السمك تأكل'] },
          { type: 'fill_blank', question: 'هي ___ بيت كبير. (has)', correctAnswer: 'لديها', options: ['لديها', 'هو', 'ليس', 'تأكل'], hint: 'She has...' },
          { type: 'listening', question: 'What is the typical Arabic sentence order?', correctAnswer: 'Verb-Subject-Object', options: ['Verb-Subject-Object', 'Subject-Verb-Object', 'Subject-Object-Verb', 'Object-Verb-Subject'] },
          { type: 'matching', question: 'Match pronouns with Arabic', correctAnswer: 'I:أنا', options: ['I:أنا', 'You:أنت', 'He:هو', 'She:هي'] },
          { type: 'fill_blank', question: 'نحن ___ عرب. (are)', correctAnswer: 'نحن', options: ['نحن', 'هم', 'أنتم', 'هن'], hint: 'We are...' },
        ]},
        { title: 'Definite Articles & Gender', desc: 'Arabic definite article "al" and gender', exercises: [
          { type: 'fill_blank', question: '___ بيت كبير (The house is big)', correctAnswer: 'ال', options: ['ال', 'أل', 'لل', 'بل'], hint: 'Definite article prefix' },
          { type: 'fill_blank', question: '___ ولد (The boy)', correctAnswer: 'ال', options: ['ال', 'أ', 'هذا', 'تلك'], hint: 'Definite article' },
          { type: 'translation', question: 'Translate: "The cat"', correctAnswer: 'القطة', options: ['القطة', 'قطة', 'القط', 'قطط'] },
          { type: 'listening', question: 'Which noun is feminine in Arabic?', correctAnswer: 'مدرسة', options: ['مدرسة', 'كتاب', 'مدرس', 'ولد'] },
          { type: 'matching', question: 'Match nouns with their gender', correctAnswer: 'مدرسة:feminine', options: ['مدرسة:feminine', 'كتاب:masculine', 'مدرس:masculine', 'سيارة:feminine'] },
          { type: 'fill_blank', question: '___ شمس مشرقة (The sun is bright)', correctAnswer: 'ال', options: ['ال', 'هذه', 'تلك', 'أل'], hint: 'Definite article' },
        ]},
        { title: 'Verb Conjugation Basics', desc: 'Present tense conjugation in Arabic', exercises: [
          { type: 'fill_blank', question: 'أنا ___ (أكتب) رسالة. (I write)', correctAnswer: 'أكتب', options: ['أكتب', 'تكتب', 'يكتب', 'نكتب'], hint: 'First person singular' },
          { type: 'fill_blank', question: 'أنت ___ (تأكل) كثيرا.', correctAnswer: 'تأكل', options: ['تأكل', 'آكل', 'يأكل', 'نأكل'], hint: 'Second person masculine' },
          { type: 'translation', question: 'Conjugate "يشرب" (drinks) for "they":', correctAnswer: 'يشربون', options: ['يشربون', 'يشرب', 'نشرب', 'تشرب'] },
          { type: 'listening', question: 'Which is the "we" form of "نذهب"?', correctAnswer: 'نذهب', options: ['نذهب', 'أذهب', 'تذهب', 'يذهب'] },
          { type: 'matching', question: 'Match verbs with their meanings', correctAnswer: 'يكتب:he writes', options: ['يكتب:he writes', 'نقرأ:we read', 'تفهم:you understand', 'أعرف:I know'] },
          { type: 'fill_blank', question: 'هي ___ (تعيش) في المدينة.', correctAnswer: 'تعيش', options: ['تعيش', 'أعيش', 'يعيش', 'نعيش'], hint: 'Third person feminine' },
        ]},
        { title: 'Tenses', desc: 'Past tense formation in Arabic', exercises: [
          { type: 'fill_blank', question: 'أمس ___ (كتبت) رسالة. (I wrote)', correctAnswer: 'كتبت', options: ['كتبت', 'أكتب', 'سأكتب', 'كنت أكتب'], hint: 'Past tense first person' },
          { type: 'fill_blank', question: 'غدا ___ (أذهب) إلى المدرسة. (I will go)', correctAnswer: 'سأذهب', options: ['سأذهب', 'ذهبت', 'أذهب', 'كنت أذهب'], hint: 'Future tense' },
          { type: 'translation', question: 'Translate: "I was happy"', correctAnswer: 'كنت سعيدا', options: ['كنت سعيدا', 'أنا سعيد', 'سأكون سعيدا', 'كنت أسعد'] },
          { type: 'listening', question: 'Which form expresses a past completed action?', correctAnswer: 'كتبت', options: ['كتبت', 'أكتب', 'سأكتب', 'أتكتب'] },
          { type: 'matching', question: 'Match tenses with their markers', correctAnswer: 'كتبت:past', options: ['كتبت:past', 'أكتب:present', 'سأكتب:future', 'كنت أكتب:past continuous'] },
          { type: 'fill_blank', question: 'عندما كنت طفلا ___ (ألعب) كثيرا.', correctAnswer: 'كنت ألعب', options: ['كنت ألعب', 'لعبت', 'سألعب', 'ألعب'], hint: 'Past continuous (كان + present)' },
        ]},
      )
      break
    case 'Yoruba':
      grammarLessons.push(
        { title: 'Basic Sentence Structure', desc: 'Yoruba word order: Subject + Verb + Object', exercises: [
          { type: 'fill_blank', question: '___ ni akẹkọọ. (I am a student)', correctAnswer: 'Mo', options: ['Mo', 'O', 'Ó', 'Wọ́n'], hint: 'First person pronoun' },
          { type: 'translation', question: 'Translate: "I eat rice"', correctAnswer: 'Mo jẹ iresi', options: ['Mo jẹ iresi', 'Iresi mo jẹ', 'Jẹ mo iresi', 'Iresi jẹ mo'] },
          { type: 'fill_blank', question: 'Ó ni ilé tó tóbi. (He/She has a big house) - What does "ni" mean?', correctAnswer: 'has/is', options: ['has/is', 'not', 'and', 'but'] },
          { type: 'listening', question: 'What is the Yoruba sentence order?', correctAnswer: 'Subject + Verb + Object', options: ['Subject + Verb + Object', 'Verb + Subject + Object', 'Object + Verb + Subject', 'Subject + Object + Verb'] },
          { type: 'matching', question: 'Match pronouns', correctAnswer: 'Mo:I', options: ['Mo:I', 'O:You', 'Ó:He/She', 'A:We'] },
          { type: 'fill_blank', question: 'Awa ___ ènìyàn. (We are people)', correctAnswer: 'jẹ́', options: ['jẹ́', 'ni', 'kìí', 'ń'], hint: 'Copula verb' },
        ]},
        { title: 'Tone Marks & Pronunciation', desc: 'Understanding Yoruba tonal system', exercises: [
          { type: 'fill_blank', question: 'Which tone mark gives a high tone in Yoruba?', correctAnswer: 'á (acute accent)', options: ['á (acute accent)', 'à (grave accent)', 'ā (macron)', 'No mark'] },
          { type: 'fill_blank', question: 'The word "ọ̀kọ̀" with low-low tone means:', correctAnswer: 'husband', options: ['husband', 'hoe', 'boat', 'spear'] },
          { type: 'translation', question: 'Translate: "ọ̀kọ́" (low-high tone)', correctAnswer: 'hoe', options: ['hoe', 'husband', 'boat', 'spear'] },
          { type: 'listening', question: 'How many tones does Yoruba have?', correctAnswer: 'Three', options: ['Three', 'Two', 'Four', 'Five'] },
          { type: 'matching', question: 'Match tones with their marks', correctAnswer: 'High:á', options: ['High:á', 'Mid:a', 'Low:à', 'Rising:â'] },
          { type: 'fill_blank', question: 'The mid tone in Yoruba is marked by:', correctAnswer: 'No diacritic mark', options: ['No diacritic mark', 'Acute accent', 'Grave accent', 'Macron'] },
        ]},
        { title: 'Verb Conjugation Basics', desc: 'Yoruba tense markers', exercises: [
          { type: 'fill_blank', question: 'Mo ___ jẹ iresi. (I am eating rice - progressive)', correctAnswer: 'ń', options: ['ń', 'ti', 'yóò', 'kò'] },
          { type: 'fill_blank', question: 'Mo ___ jẹ iresi. (I ate rice - past)', correctAnswer: 'ti', options: ['ti', 'ń', 'yóò', 'kò'] },
          { type: 'translation', question: 'Translate: "I will eat rice"', correctAnswer: 'Mo yóò jẹ iresi', options: ['Mo yóò jẹ iresi', 'Mo ti jẹ iresi', 'Mo ń jẹ iresi', 'Mo kò jẹ iresi'] },
          { type: 'listening', question: 'Which marker indicates future tense in Yoruba?', correctAnswer: 'yóò', options: ['yóò', 'ń', 'ti', 'kò'] },
          { type: 'matching', question: 'Match tense markers with meanings', correctAnswer: 'ń:present progressive', options: ['ń:present progressive', 'ti:past', 'yóò:future', 'kò:negative'] },
          { type: 'fill_blank', question: 'Ó ___ lo sí ilé. (He went home - past)', correctAnswer: 'ti', options: ['ti', 'ń', 'yóò', 'maa'] },
        ]},
        { title: 'Negation', desc: 'How to form negative sentences in Yoruba', exercises: [
          { type: 'fill_blank', question: 'Mo ___ fẹ́ràn oúnjẹ yẹn. (I do not like that food)', correctAnswer: 'kò', options: ['kò', 'ń', 'ti', 'yóò'] },
          { type: 'fill_blank', question: 'Kí ni ó ___ jẹ? (What did he not eat?)', correctAnswer: 'kìí', options: ['kìí', 'kò', 'ń', 'ti'] },
          { type: 'translation', question: 'Translate: "I will not go"', correctAnswer: 'Mo kò yóò lọ', options: ['Mo kò yóò lọ', 'Mo ti kò lọ', 'Mo kò ń lọ', 'Mo kìí lọ'] },
          { type: 'listening', question: 'Which word means "not" in Yoruba?', correctAnswer: 'kò', options: ['kò', 'ń', 'ti', 'pẹ̀lú'] },
          { type: 'matching', question: 'Match negative markers', correctAnswer: 'kò:not (habitual)', options: ['kò:not (habitual)', 'kìí:not (ability)', 'kíì:not (future)', 'ràrá:no/never'] },
          { type: 'fill_blank', question: 'Ó ___ lè lo. (He cannot go)', correctAnswer: 'kò', options: ['kò', 'kìí', 'ń', 'ti'] },
        ]},
      )
      break
    case 'Hindi':
      grammarLessons.push(
        { title: 'Basic Sentence Structure', desc: 'Hindi word order: Subject + Object + Verb', exercises: [
          { type: 'fill_blank', question: '___ विद्यार्थी हूँ। (I am a student)', correctAnswer: 'मैं', options: ['मैं', 'तुम', 'वह', 'वे'], hint: 'First person pronoun' },
          { type: 'translation', question: 'Translate: "I eat rice"', correctAnswer: 'मैं चावल खाता हूँ', options: ['मैं चावल खाता हूँ', 'चावल मैं खाता हूँ', 'खाता मैं चावल हूँ', 'चावल खाता मैं हूँ'] },
          { type: 'fill_blank', question: 'वह ___ बड़ा घर है। (has/is)', correctAnswer: 'का', options: ['का', 'ने', 'को', 'से'], hint: 'Possessive marker' },
          { type: 'listening', question: 'What is the typical Hindi sentence order?', correctAnswer: 'Subject + Object + Verb', options: ['Subject + Object + Verb', 'Subject + Verb + Object', 'Verb + Subject + Object', 'Object + Verb + Subject'] },
          { type: 'matching', question: 'Match pronouns', correctAnswer: 'मैं:I', options: ['मैं:I', 'तुम:You', 'वह:He/She', 'हम:We'] },
          { type: 'fill_blank', question: 'हम ___ हिंदी बोलते हैं। (We speak Hindi)', correctAnswer: 'हिंदी', options: ['हिंदी', 'को', 'से', 'में'], hint: 'Hindi language' },
        ]},
        { title: 'Nouns & Gender', desc: 'Hindi noun genders and postpositions', exercises: [
          { type: 'fill_blank', question: 'लड़का (boy) is ___ gender', correctAnswer: 'masculine', options: ['masculine', 'feminine', 'neuter', 'common'] },
          { type: 'fill_blank', question: 'लड़की (girl) is ___ gender', correctAnswer: 'feminine', options: ['feminine', 'masculine', 'neuter', 'common'] },
          { type: 'translation', question: 'Translate: "In the house"', correctAnswer: 'घर में', options: ['घर में', 'घर का', 'घर को', 'घर से'] },
          { type: 'listening', question: 'Which postposition means "in"?', correctAnswer: 'में', options: ['में', 'पर', 'को', 'से'] },
          { type: 'matching', question: 'Match postpositions with meaning', correctAnswer: 'में:in', options: ['में:in', 'पर:on', 'को:to', 'से:from'] },
          { type: 'fill_blank', question: 'किताब ___ टेबल पर है। (The book is on the table)', correctAnswer: 'की', options: ['की', 'का', 'के', 'है'], hint: 'Feminine possessive' },
        ]},
        { title: 'Verb Conjugation Basics', desc: 'Hindi present tense conjugation', exercises: [
          { type: 'fill_blank', question: 'मैं खाना ___ हूँ। (I eat)', correctAnswer: 'खाता', options: ['खाता', 'खाते', 'खाती', 'खाता है'] },
          { type: 'fill_blank', question: 'वह खाना ___ है। (He eats)', correctAnswer: 'खाता', options: ['खाता', 'खाते', 'खाती', 'खाता हूँ'] },
          { type: 'translation', question: 'Translate: "She eats" (feminine)', correctAnswer: 'वह खाती है', options: ['वह खाती है', 'वह खाता है', 'वह खाते हैं', 'वह खाती हूँ'] },
          { type: 'listening', question: 'What is the "we" form of "eat"?', correctAnswer: 'हम खाते हैं', options: ['हम खाते हैं', 'मैं खाता हूँ', 'तुम खाते हो', 'वे खाते हैं'] },
          { type: 'matching', question: 'Match subject pronouns with correct verb forms', correctAnswer: 'मैं:खाता हूँ', options: ['मैं:खाता हूँ', 'तुम:खाते हो', 'वह (m):खाता है', 'वह (f):खाती है'] },
          { type: 'fill_blank', question: 'हम ___ हैं। (We are)', correctAnswer: 'हैं', options: ['हैं', 'हूँ', 'हो', 'है'] },
        ]},
        { title: 'Tenses', desc: 'Hindi past, present, and future tenses', exercises: [
          { type: 'fill_blank', question: 'कल मैं चावल ___। (I ate rice yesterday)', correctAnswer: 'खाया', options: ['खाया', 'खाता हूँ', 'खाऊंगा', 'खा रहा था'] },
          { type: 'fill_blank', question: 'कल मैं चावल ___। (I will eat rice tomorrow)', correctAnswer: 'खाऊंगा', options: ['खाऊंगा', 'खाया', 'खाता हूँ', 'खाता था'] },
          { type: 'translation', question: 'Translate: "I was eating"', correctAnswer: 'मैं खा रहा था', options: ['मैं खा रहा था', 'मैं खाया', 'मैं खाता हूँ', 'मैं खाऊंगा'] },
          { type: 'listening', question: 'Which form indicates continuous action in the past?', correctAnswer: 'रहा था', options: ['रहा था', 'या', 'ता हूँ', 'ऊंगा'] },
          { type: 'matching', question: 'Match tenses with their markers', correctAnswer: 'खाया:past', options: ['खाया:past', 'खाता है:present', 'खाऊंगा:future', 'खा रहा था:past continuous'] },
          { type: 'fill_blank', question: 'जब मैं बच्चा था, मैं रोज ___। (I used to play daily)', correctAnswer: 'खेलता था', options: ['खेलता था', 'खेला', 'खेलूंगा', 'खेलता हूँ'] },
        ]},
      )
      break
    case 'Swahili':
      grammarLessons.push(
        { title: 'Basic Sentence Structure', desc: 'Swahili word order: Subject + Verb + Object', exercises: [
          { type: 'fill_blank', question: '___ ni mwanafunzi. (I am a student)', correctAnswer: 'Mimi', options: ['Mimi', 'Wewe', 'Yeye', 'Sisi'], hint: 'First person pronoun' },
          { type: 'translation', question: 'Translate: "I eat rice"', correctAnswer: 'Mimi ninakula wali', options: ['Mimi ninakula wali', 'Wali mimi ninakula', 'Ninakula mimi wali', 'Wali ninakula mimi'] },
          { type: 'fill_blank', question: 'Ana ___ kubwa. (has/is)', correctAnswer: 'nyumba', options: ['nyumba', 'kula', 'enda', 'soma'], hint: 'House in Swahili' },
          { type: 'listening', question: 'What is the Swahili sentence order?', correctAnswer: 'Subject + Verb + Object', options: ['Subject + Verb + Object', 'Verb + Subject + Object', 'Subject + Object + Verb', 'Object + Subject + Verb'] },
          { type: 'matching', question: 'Match pronouns', correctAnswer: 'Mimi:I', options: ['Mimi:I', 'Wewe:You', 'Yeye:He/She', 'Sisi:We'] },
          { type: 'fill_blank', question: 'Sisi ___ Kiswahili. (We speak Swahili)', correctAnswer: 'tunaongea', options: ['tunaongea', 'unaongea', 'anaongea', 'wanaongea'] },
        ]},
        { title: 'Noun Classes', desc: 'Swahili noun class system basics', exercises: [
          { type: 'fill_blank', question: 'Mtoto (child) belongs to noun class ___ (prefix m-/wa-)', correctAnswer: '1/2', options: ['1/2', '3/4', '5/6', '7/8'] },
          { type: 'fill_blank', question: 'The plural of "mtoto" (child) is:', correctAnswer: 'watoto', options: ['watoto', 'mitoto', 'vitoto', 'zetoto'] },
          { type: 'translation', question: 'Translate: "The children"', correctAnswer: 'Watoto', options: ['Watoto', 'Mtoto', 'Vitoto', 'Watatu'] },
          { type: 'listening', question: 'How many noun classes does Swahili have?', correctAnswer: 'About 18', options: ['About 18', '2', '3', '8'] },
          { type: 'matching', question: 'Match singular/plural pairs', correctAnswer: 'mtoto/watoto', options: ['mtoto/watoto', 'kiti/viti', 'mti/miti', 'chumba/vyumba'] },
          { type: 'fill_blank', question: 'The plural of "kitabu" (book) is:', correctAnswer: 'vitabu', options: ['vitabu', 'mitabu', 'watabu', 'kitabu'] },
        ]},
        { title: 'Verb Conjugation Basics', desc: 'Swahili present tense with subject prefixes', exercises: [
          { type: 'fill_blank', question: '___ nakula chakula. (I eat food)', correctAnswer: 'Ni', options: ['Ni', 'U', 'A', 'Tu'] },
          { type: 'fill_blank', question: 'U___ chakula. (You eat food)', correctAnswer: 'na', options: ['na', 'a', 'tu', 'wa'] },
          { type: 'translation', question: 'Conjugate "kula" (eat) for "they":', correctAnswer: 'Wanakula', options: ['Wanakula', 'Anakula', 'Unakula', 'Tunakula'] },
          { type: 'listening', question: 'What is the "we" prefix for present tense?', correctAnswer: 'Tu', options: ['Tu', 'Ni', 'Mu', 'Wa'] },
          { type: 'matching', question: 'Match prefixes with pronouns', correctAnswer: 'Ni:I', options: ['Ni:I', 'U:You', 'A:He/She', 'Tu:We'] },
          { type: 'fill_blank', question: '___ anaenda shuleni. (He goes to school)', correctAnswer: 'Yeye', options: ['Yeye', 'Mimi', 'Wewe', 'Sisi'] },
        ]},
        { title: 'Tenses', desc: 'Past, present, and future tense markers', exercises: [
          { type: 'fill_blank', question: 'Jana ___ likula wali. (I ate rice yesterday)', correctAnswer: 'nili', options: ['nili', 'nina', 'nita', 'nilikuwa'] },
          { type: 'fill_blank', question: 'Kesho ___ takula wali. (I will eat rice tomorrow)', correctAnswer: 'nita', options: ['nita', 'nina', 'nili', 'nilikuwa nikila'] },
          { type: 'translation', question: 'Translate: "I was eating"', correctAnswer: 'Nilikuwa nikila', options: ['Nilikuwa nikila', 'Nilikula', 'Ninakula', 'Nitakula'] },
          { type: 'listening', question: 'Which prefix indicates past tense?', correctAnswer: 'li', options: ['li', 'na', 'ta', 'ku'] },
          { type: 'matching', question: 'Match tense markers', correctAnswer: 'na:present', options: ['na:present', 'li:past', 'ta:future', 'ku:infinitive'] },
          { type: 'fill_blank', question: 'Wakati wa utoto, ___ nilicheza michezo. (As a child, I used to play)', correctAnswer: 'nilikuwa', options: ['nilikuwa', 'nina', 'nili', 'nita'] },
        ]},
      )
      break
  }

  for (const gl of grammarLessons) {
    const level = orderIdx < 14 ? 2 : 3
    lessons.push({
      title: gl.title,
      description: gl.desc,
      category: 'grammar',
      level,
      orderIndex: orderIdx++,
      xpReward: 20,
      exercises: gl.exercises,
    })
  }

  return lessons
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if lessons already exist
    const existingCount = await db.lesson.count()
    if (existingCount > 0) {
      return NextResponse.json({ message: 'Lessons already seeded', count: existingCount })
    }

    let totalLessons = 0
    let totalExercises = 0

    for (const lang of LANGUAGE_PAIRS) {
      const lessons = generateLessonsForLanguage(lang.target)

      for (const lesson of lessons) {
        const createdLesson = await db.lesson.create({
          data: {
            title: lesson.title,
            description: lesson.description,
            category: lesson.category,
            targetLanguage: lang.target,
            nativeLanguage: 'English',
            level: lesson.level,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            exercises: {
              create: lesson.exercises.map((ex, idx) => ({
                type: ex.type,
                question: ex.question,
                correctAnswer: ex.correctAnswer,
                options: JSON.stringify(ex.options),
                hint: ex.hint || null,
                orderIndex: idx,
                xpReward: 5,
              })),
            },
          },
        })

        totalLessons++
        totalExercises += lesson.exercises.length
      }
    }

    return NextResponse.json({
      message: 'Seed completed successfully',
      languages: LANGUAGE_PAIRS.length,
      lessons: totalLessons,
      exercises: totalExercises,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
