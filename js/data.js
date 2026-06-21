/*
 * data.js — Curated content for the Baby Keyboard Game.
 *
 * Content is organised into CATEGORIES. Each category has:
 *   - key  : stable id used in settings/localStorage
 *   - en/bn: the category's name (English / Bangla) shown on its picker chip
 *   - icon : one emoji shown on the chip
 *   - items: [{ char, en, bn }]
 *       char : the emoji glyph shown on screen (upgraded to a crisp SVG by Twemoji)
 *       en   : English word spoken aloud (Web Speech API)
 *       bn   : Bangla (বাংলা) word spoken aloud when the language is বাংলা
 *
 * app.js also builds a virtual "all" category that mixes every item together.
 *
 * Exposed on the global object so plain <script> tags (no bundler / no modules)
 * keep working when opened directly from disk or served by GitHub Pages.
 */
(function (global) {
  'use strict';

  var ANIMALS = [
    { char: '🐶', en: 'Dog', bn: 'কুকুর' },
    { char: '🐱', en: 'Cat', bn: 'বিড়াল' },
    { char: '🐭', en: 'Mouse', bn: 'ইঁদুর' },
    { char: '🐹', en: 'Hamster', bn: 'হ্যামস্টার' },
    { char: '🐰', en: 'Bunny', bn: 'খরগোশ' },
    { char: '🦊', en: 'Fox', bn: 'শিয়াল' },
    { char: '🐻', en: 'Bear', bn: 'ভালুক' },
    { char: '🐼', en: 'Panda', bn: 'পান্ডা' },
    { char: '🐨', en: 'Koala', bn: 'কোয়ালা' },
    { char: '🐯', en: 'Tiger', bn: 'বাঘ' },
    { char: '🦁', en: 'Lion', bn: 'সিংহ' },
    { char: '🐮', en: 'Cow', bn: 'গরু' },
    { char: '🐷', en: 'Pig', bn: 'শূকর' },
    { char: '🐸', en: 'Frog', bn: 'ব্যাঙ' },
    { char: '🐵', en: 'Monkey', bn: 'বানর' },
    { char: '🐔', en: 'Chicken', bn: 'মুরগি' },
    { char: '🐧', en: 'Penguin', bn: 'পেঙ্গুইন' },
    { char: '🐦', en: 'Bird', bn: 'পাখি' },
    { char: '🐤', en: 'Baby Chick', bn: 'ছানা' },
    { char: '🦆', en: 'Duck', bn: 'হাঁস' },
    { char: '🦉', en: 'Owl', bn: 'পেঁচা' },
    { char: '🦇', en: 'Bat', bn: 'বাদুড়' },
    { char: '🐺', en: 'Wolf', bn: 'নেকড়ে' },
    { char: '🐴', en: 'Horse', bn: 'ঘোড়া' },
    { char: '🦄', en: 'Unicorn', bn: 'ইউনিকর্ন' },
    { char: '🐝', en: 'Bee', bn: 'মৌমাছি' },
    { char: '🐛', en: 'Caterpillar', bn: 'শুঁয়োপোকা' },
    { char: '🦋', en: 'Butterfly', bn: 'প্রজাপতি' },
    { char: '🐌', en: 'Snail', bn: 'শামুক' },
    { char: '🐞', en: 'Ladybug', bn: 'লেডিবাগ' },
    { char: '🐢', en: 'Turtle', bn: 'কচ্ছপ' },
    { char: '🐍', en: 'Snake', bn: 'সাপ' },
    { char: '🦎', en: 'Lizard', bn: 'টিকটিকি' },
    { char: '🦖', en: 'Dinosaur', bn: 'ডাইনোসর' },
    { char: '🐉', en: 'Dragon', bn: 'ড্রাগন' },
    { char: '🐳', en: 'Whale', bn: 'তিমি' },
    { char: '🐬', en: 'Dolphin', bn: 'ডলফিন' },
    { char: '🐟', en: 'Fish', bn: 'মাছ' },
    { char: '🐠', en: 'Tropical Fish', bn: 'রঙিন মাছ' },
    { char: '🦈', en: 'Shark', bn: 'হাঙর' },
    { char: '🐙', en: 'Octopus', bn: 'অক্টোপাস' },
    { char: '🦀', en: 'Crab', bn: 'কাঁকড়া' },
    { char: '🐘', en: 'Elephant', bn: 'হাতি' },
    { char: '🦏', en: 'Rhino', bn: 'গন্ডার' },
    { char: '🦛', en: 'Hippo', bn: 'জলহস্তী' },
    { char: '🐫', en: 'Camel', bn: 'উট' },
    { char: '🦒', en: 'Giraffe', bn: 'জিরাফ' },
    { char: '🦘', en: 'Kangaroo', bn: 'ক্যাঙ্গারু' },
    { char: '🦓', en: 'Zebra', bn: 'জেব্রা' },
    { char: '🦍', en: 'Gorilla', bn: 'গরিলা' },
    { char: '🦌', en: 'Deer', bn: 'হরিণ' },
    { char: '🐑', en: 'Sheep', bn: 'ভেড়া' },
    { char: '🐐', en: 'Goat', bn: 'ছাগল' },
    { char: '🦙', en: 'Llama', bn: 'লামা' },
    { char: '🦥', en: 'Sloth', bn: 'স্লথ' },
    { char: '🦦', en: 'Otter', bn: 'ভোঁদড়' },
    { char: '🦩', en: 'Flamingo', bn: 'ফ্লেমিঙ্গো' },
    { char: '🦚', en: 'Peacock', bn: 'ময়ূর' },
    { char: '🦜', en: 'Parrot', bn: 'টিয়া' },
    { char: '🦢', en: 'Swan', bn: 'রাজহাঁস' },
    { char: '🐓', en: 'Rooster', bn: 'মোরগ' },
    { char: '🦔', en: 'Hedgehog', bn: 'শজারু' }
  ];

  var FAMILY = [
    { char: '👩', en: 'Mother', bn: 'মা' },
    { char: '👨', en: 'Father', bn: 'বাবা' },
    { char: '👶', en: 'Baby', bn: 'বাবু' },
    { char: '👦', en: 'Brother', bn: 'ভাই' },
    { char: '👧', en: 'Sister', bn: 'বোন' },
    { char: '👴', en: "Grandpa (Father's side)", bn: 'দাদা' },
    { char: '👵', en: "Grandma (Father's side)", bn: 'দাদি' },
    { char: '🧓', en: "Grandpa (Mother's side)", bn: 'নানা' },
    { char: '🧕', en: "Grandma (Mother's side)", bn: 'নানি' },
    { char: '🧔', en: "Uncle (Father's brother)", bn: 'চাচা' },
    { char: '👨‍🦰', en: "Uncle (Mother's brother)", bn: 'মামা' },
    { char: '👩‍🦰', en: "Aunt (Mother's sister)", bn: 'খালা' },
    { char: '👩‍🦱', en: "Aunt (Father's sister)", bn: 'ফুপু' },
    { char: '🧒', en: 'Child', bn: 'খোকা' },
    { char: '👨‍👩‍👧‍👦', en: 'Family', bn: 'পরিবার' },
    { char: '❤️', en: 'Love', bn: 'ভালোবাসা' }
  ];

  var FRUITS = [
    { char: '🥭', en: 'Mango', bn: 'আম' },
    { char: '🍌', en: 'Banana', bn: 'কলা' },
    { char: '🍎', en: 'Apple', bn: 'আপেল' },
    { char: '🍏', en: 'Green Apple', bn: 'সবুজ আপেল' },
    { char: '🍊', en: 'Orange', bn: 'কমলা' },
    { char: '🍇', en: 'Grapes', bn: 'আঙুর' },
    { char: '🍉', en: 'Watermelon', bn: 'তরমুজ' },
    { char: '🍍', en: 'Pineapple', bn: 'আনারস' },
    { char: '🥥', en: 'Coconut', bn: 'নারকেল' },
    { char: '🍐', en: 'Pear', bn: 'নাশপাতি' },
    { char: '🍓', en: 'Strawberry', bn: 'স্ট্রবেরি' },
    { char: '🍒', en: 'Cherry', bn: 'চেরি' },
    { char: '🍋', en: 'Lemon', bn: 'লেবু' },
    { char: '🍑', en: 'Peach', bn: 'পীচ' },
    { char: '🥝', en: 'Kiwi', bn: 'কিউই' },
    { char: '🫐', en: 'Blueberry', bn: 'ব্লুবেরি' },
    { char: '🍈', en: 'Melon', bn: 'বাঙ্গি' },
    { char: '🥑', en: 'Avocado', bn: 'অ্যাভোকাডো' },
    { char: '🫒', en: 'Olive', bn: 'জলপাই' }
  ];

  var VEGETABLES = [
    { char: '🥕', en: 'Carrot', bn: 'গাজর' },
    { char: '🥔', en: 'Potato', bn: 'আলু' },
    { char: '🍅', en: 'Tomato', bn: 'টমেটো' },
    { char: '🍆', en: 'Eggplant', bn: 'বেগুন' },
    { char: '🌽', en: 'Corn', bn: 'ভুট্টা' },
    { char: '🥒', en: 'Cucumber', bn: 'শসা' },
    { char: '🌶️', en: 'Chili', bn: 'মরিচ' },
    { char: '🫑', en: 'Bell Pepper', bn: 'ক্যাপসিকাম' },
    { char: '🧅', en: 'Onion', bn: 'পেঁয়াজ' },
    { char: '🧄', en: 'Garlic', bn: 'রসুন' },
    { char: '🥬', en: 'Leafy Green', bn: 'শাক' },
    { char: '🥦', en: 'Broccoli', bn: 'ব্রকলি' },
    { char: '🍄', en: 'Mushroom', bn: 'মাশরুম' },
    { char: '🫛', en: 'Peas', bn: 'মটরশুঁটি' },
    { char: '🫚', en: 'Ginger', bn: 'আদা' },
    { char: '🎃', en: 'Pumpkin', bn: 'কুমড়া' }
  ];

  var FOOD = [
    { char: '🍚', en: 'Rice', bn: 'ভাত' },
    { char: '🍞', en: 'Bread', bn: 'রুটি' },
    { char: '🥚', en: 'Egg', bn: 'ডিম' },
    { char: '🍖', en: 'Meat', bn: 'মাংস' },
    { char: '🍗', en: 'Chicken Leg', bn: 'মুরগির রান' },
    { char: '🍛', en: 'Curry', bn: 'তরকারি' },
    { char: '🥛', en: 'Milk', bn: 'দুধ' },
    { char: '🍵', en: 'Tea', bn: 'চা' },
    { char: '🧃', en: 'Juice', bn: 'জুস' },
    { char: '🍜', en: 'Noodles', bn: 'নুডলস' },
    { char: '🧀', en: 'Cheese', bn: 'পনির' },
    { char: '🍯', en: 'Honey', bn: 'মধু' },
    { char: '🍕', en: 'Pizza', bn: 'পিজা' },
    { char: '🍔', en: 'Burger', bn: 'বার্গার' },
    { char: '🍦', en: 'Ice Cream', bn: 'আইসক্রিম' },
    { char: '🎂', en: 'Cake', bn: 'কেক' },
    { char: '🧁', en: 'Cupcake', bn: 'কাপকেক' },
    { char: '🍫', en: 'Chocolate', bn: 'চকলেট' },
    { char: '🍪', en: 'Cookie', bn: 'বিস্কুট' },
    { char: '🍭', en: 'Lollipop', bn: 'ললিপপ' },
    { char: '🍩', en: 'Donut', bn: 'ডোনাট' },
    { char: '🍬', en: 'Candy', bn: 'লজেন্স' }
  ];

  var VEHICLES = [
    { char: '🚗', en: 'Car', bn: 'গাড়ি' },
    { char: '🚕', en: 'Taxi', bn: 'ট্যাক্সি' },
    { char: '🚌', en: 'Bus', bn: 'বাস' },
    { char: '🚚', en: 'Truck', bn: 'ট্রাক' },
    { char: '🚜', en: 'Tractor', bn: 'ট্রাক্টর' },
    { char: '🛺', en: 'Auto Rickshaw', bn: 'অটো' },
    { char: '🚑', en: 'Ambulance', bn: 'অ্যাম্বুলেন্স' },
    { char: '🚒', en: 'Fire Truck', bn: 'দমকল গাড়ি' },
    { char: '🚓', en: 'Police Car', bn: 'পুলিশ গাড়ি' },
    { char: '🚲', en: 'Bicycle', bn: 'সাইকেল' },
    { char: '🏍️', en: 'Motorcycle', bn: 'মোটরসাইকেল' },
    { char: '🛵', en: 'Scooter', bn: 'স্কুটার' },
    { char: '🚂', en: 'Train', bn: 'ট্রেন' },
    { char: '🚆', en: 'Metro Train', bn: 'মেট্রো রেল' },
    { char: '✈️', en: 'Plane', bn: 'বিমান' },
    { char: '🚁', en: 'Helicopter', bn: 'হেলিকপ্টার' },
    { char: '🚀', en: 'Rocket', bn: 'রকেট' },
    { char: '⛵', en: 'Boat', bn: 'নৌকা' },
    { char: '🚢', en: 'Ship', bn: 'জাহাজ' },
    { char: '⛴️', en: 'Ferry', bn: 'লঞ্চ' },
    { char: '🚤', en: 'Speedboat', bn: 'স্পিডবোট' },
    { char: '🚐', en: 'Van', bn: 'মাইক্রোবাস' }
  ];

  var NATURE = [
    { char: '☀️', en: 'Sun', bn: 'সূর্য' },
    { char: '🌙', en: 'Moon', bn: 'চাঁদ' },
    { char: '⭐', en: 'Star', bn: 'তারা' },
    { char: '🌈', en: 'Rainbow', bn: 'রংধনু' },
    { char: '☁️', en: 'Cloud', bn: 'মেঘ' },
    { char: '🌧️', en: 'Rain', bn: 'বৃষ্টি' },
    { char: '❄️', en: 'Snow', bn: 'তুষার' },
    { char: '⚡', en: 'Lightning', bn: 'বাজ' },
    { char: '🔥', en: 'Fire', bn: 'আগুন' },
    { char: '💧', en: 'Water Drop', bn: 'পানির ফোঁটা' },
    { char: '🌊', en: 'Wave', bn: 'ঢেউ' },
    { char: '🌸', en: 'Flower', bn: 'ফুল' },
    { char: '🌹', en: 'Rose', bn: 'গোলাপ' },
    { char: '🌻', en: 'Sunflower', bn: 'সূর্যমুখী' },
    { char: '🌷', en: 'Tulip', bn: 'টিউলিপ ফুল' },
    { char: '🌳', en: 'Tree', bn: 'গাছ' },
    { char: '🍃', en: 'Leaf', bn: 'পাতা' },
    { char: '⛰️', en: 'Mountain', bn: 'পাহাড়' },
    { char: '🌍', en: 'Earth', bn: 'পৃথিবী' }
  ];

  var FACES = [
    { char: '😀', en: 'Smiley Face', bn: 'হাসিমুখ' },
    { char: '😄', en: 'Big Smile', bn: 'বড় হাসি' },
    { char: '😁', en: 'Grinning Face', bn: 'দাঁত বের করা হাসি' },
    { char: '😊', en: 'Happy Face', bn: 'মিষ্টি হাসি' },
    { char: '🤣', en: 'Laughing', bn: 'হাসতে হাসতে' },
    { char: '🥰', en: 'Loving Face', bn: 'আদুরে মুখ' },
    { char: '😍', en: 'Heart Eyes', bn: 'চোখে ভালোবাসা' },
    { char: '🤩', en: 'Star Eyes', bn: 'তারা চোখ' },
    { char: '😎', en: 'Cool Face', bn: 'দারুণ মুখ' },
    { char: '😋', en: 'Yummy Face', bn: 'মজার মুখ' },
    { char: '😜', en: 'Silly Face', bn: 'দুষ্টু মুখ' },
    { char: '😮', en: 'Surprised Face', bn: 'অবাক মুখ' },
    { char: '😴', en: 'Sleepy Face', bn: 'ঘুমন্ত মুখ' },
    { char: '😭', en: 'Crying Face', bn: 'কান্না' },
    { char: '😡', en: 'Angry Face', bn: 'রাগী মুখ' },
    { char: '❤️', en: 'Red Heart', bn: 'লাল মন' },
    { char: '💛', en: 'Yellow Heart', bn: 'হলুদ মন' },
    { char: '💙', en: 'Blue Heart', bn: 'নীল মন' },
    { char: '✨', en: 'Sparkles', bn: 'ঝিকিমিকি' }
  ];

  var THINGS = [
    { char: '🎈', en: 'Balloon', bn: 'বেলুন' },
    { char: '🎁', en: 'Gift', bn: 'উপহার' },
    { char: '⚽', en: 'Ball', bn: 'বল' },
    { char: '🧸', en: 'Teddy Bear', bn: 'টেডি' },
    { char: '🪁', en: 'Kite', bn: 'ঘুড়ি' },
    { char: '📚', en: 'Book', bn: 'বই' },
    { char: '✏️', en: 'Pencil', bn: 'পেন্সিল' },
    { char: '🖍️', en: 'Crayon', bn: 'রঙ পেন্সিল' },
    { char: '🎨', en: 'Paint', bn: 'রং' },
    { char: '⏰', en: 'Clock', bn: 'ঘড়ি' },
    { char: '☂️', en: 'Umbrella', bn: 'ছাতা' },
    { char: '🔑', en: 'Key', bn: 'চাবি' },
    { char: '💡', en: 'Light', bn: 'বাতি' },
    { char: '🔔', en: 'Bell', bn: 'ঘণ্টা' },
    { char: '👑', en: 'Crown', bn: 'মুকুট' },
    { char: '🎵', en: 'Music', bn: 'গান' },
    { char: '📱', en: 'Phone', bn: 'ফোন' },
    { char: '📷', en: 'Camera', bn: 'ক্যামেরা' },
    { char: '🥁', en: 'Drum', bn: 'ঢোল' },
    { char: '🎉', en: 'Party', bn: 'উৎসব' },
    { char: '🎒', en: 'Bag', bn: 'ব্যাগ' },
    { char: '🧩', en: 'Puzzle', bn: 'পাজল' }
  ];

  global.GAME_DATA = {
    categories: [
      { key: 'animals', en: 'Animals', bn: 'প্রাণী', icon: '🐶', items: ANIMALS },
      { key: 'family', en: 'Family', bn: 'পরিবার', icon: '👨‍👩‍👧‍👦', items: FAMILY },
      { key: 'fruits', en: 'Fruits', bn: 'ফল', icon: '🍎', items: FRUITS },
      { key: 'vegetables', en: 'Vegetables', bn: 'সবজি', icon: '🥕', items: VEGETABLES },
      { key: 'food', en: 'Food', bn: 'খাবার', icon: '🍚', items: FOOD },
      { key: 'vehicles', en: 'Vehicles', bn: 'যানবাহন', icon: '🚗', items: VEHICLES },
      { key: 'nature', en: 'Nature', bn: 'প্রকৃতি', icon: '🌳', items: NATURE },
      { key: 'faces', en: 'Faces', bn: 'মুখ', icon: '😀', items: FACES },
      { key: 'things', en: 'Things', bn: 'জিনিস', icon: '🧸', items: THINGS }
    ]
  };
})(window);
