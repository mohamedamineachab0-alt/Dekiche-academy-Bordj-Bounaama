const fs = require('fs');

const subjects = [];
const defaultImage = "https://images.unsplash.com/photo-1546410531-bea5acadb043?q=80&w=600&auto=format&fit=crop";

function add(title, desc, phase, levels, streams = ["NONE"]) {
  subjects.push({
    title,
    description: desc,
    image: defaultImage,
    price: 0,
    accessType: "YEARLY",
    phase,
    levels,
    streams
  });
}

// PRIMARY
const pAll = ["PRIMARY_1", "PRIMARY_2", "PRIMARY_3", "PRIMARY_4", "PRIMARY_5"];
const p35 = ["PRIMARY_3", "PRIMARY_4", "PRIMARY_5"];
const p45 = ["PRIMARY_4", "PRIMARY_5"];

add("اللغة العربية", "مادة اللغة العربية", "PRIMARY", pAll);
add("الرياضيات", "مادة الرياضيات", "PRIMARY", pAll);
add("التربية الإسلامية", "التربية الإسلامية", "PRIMARY", pAll);
add("التربية المدنية", "التربية المدنية", "PRIMARY", pAll);
add("التربية العلمية والتكنولوجية", "التربية العلمية والتكنولوجية", "PRIMARY", pAll);
add("التربية الفنية", "التربية الفنية والتشكيلية", "PRIMARY", pAll);
add("التربية البدنية والرياضية", "الرياضة", "PRIMARY", pAll);
add("التاريخ والجغرافيا", "التاريخ والجغرافيا", "PRIMARY", p35);
add("اللغة الفرنسية", "اللغة الفرنسية", "PRIMARY", p35);
add("اللغة الأمازيغية", "اللغة الأمازيغية", "PRIMARY", p45);

// MIDDLE
const mAll = ["MIDDLE_1", "MIDDLE_2", "MIDDLE_3", "MIDDLE_4"];
add("اللغة العربية", "اللغة العربية", "MIDDLE", mAll);
add("الرياضيات", "الرياضيات", "MIDDLE", mAll);
add("التربية الإسلامية", "التربية الإسلامية", "MIDDLE", mAll);
add("التربية المدنية", "التربية المدنية", "MIDDLE", mAll);
add("التاريخ والجغرافيا", "التاريخ والجغرافيا", "MIDDLE", mAll);
add("علوم الطبيعة والحياة", "العلوم الطبيعية", "MIDDLE", mAll);
add("العلوم الفيزيائية والتكنولوجيا", "الفيزياء", "MIDDLE", mAll);
add("اللغة الفرنسية", "اللغة الفرنسية", "MIDDLE", mAll);
add("اللغة الإنجليزية", "اللغة الإنجليزية", "MIDDLE", mAll);
add("اللغة الأمازيغية", "اللغة الأمازيغية", "MIDDLE", mAll);
add("الإعلام الآلي", "الإعلام الآلي", "MIDDLE", mAll);
add("التربية الفنية", "التربية الفنية والتشكيلية", "MIDDLE", mAll);
add("التربية البدنية والرياضية", "الرياضة", "MIDDLE", mAll);

// SECONDARY
const sAll = ["SECONDARY_1", "SECONDARY_2", "SECONDARY_3"];
const s1 = ["SECONDARY_1"];
const s23 = ["SECONDARY_2", "SECONDARY_3"];

// Shared Across all streams
const allStreams = [
  "COMMON_SCIENCE", "COMMON_LETTERS",
  "EXPERIMENTAL_SCIENCES", "MATHEMATICS", "TECHNICAL_MATH",
  "MANAGEMENT_ECONOMY", "LITERATURE_PHILOSOPHY", "FOREIGN_LANGUAGES"
];

// Arabic is taken by everyone
add("الأدب العربي", "الأدب العربي", "SECONDARY", sAll, allStreams);
add("التربية الإسلامية", "التربية الإسلامية", "SECONDARY", sAll, allStreams);
add("اللغة الفرنسية", "اللغة الفرنسية", "SECONDARY", sAll, allStreams);
add("اللغة الإنجليزية", "اللغة الإنجليزية", "SECONDARY", sAll, allStreams);
add("التاريخ والجغرافيا", "التاريخ والجغرافيا", "SECONDARY", sAll, allStreams);
add("التربية البدنية والرياضية", "الرياضة", "SECONDARY", sAll, allStreams);
add("اللغة الأمازيغية", "اللغة الأمازيغية", "SECONDARY", sAll, allStreams);

// Maths
add("الرياضيات", "الرياضيات للشعب العلمية", "SECONDARY", sAll, ["COMMON_SCIENCE", "EXPERIMENTAL_SCIENCES", "MATHEMATICS", "TECHNICAL_MATH", "MANAGEMENT_ECONOMY"]);
add("الرياضيات (أدبية)", "الرياضيات للشعب الأدبية", "SECONDARY", sAll, ["COMMON_LETTERS", "LITERATURE_PHILOSOPHY", "FOREIGN_LANGUAGES"]);

// Physics
add("العلوم الفيزيائية", "الفيزياء", "SECONDARY", sAll, ["COMMON_SCIENCE", "EXPERIMENTAL_SCIENCES", "MATHEMATICS", "TECHNICAL_MATH"]);
add("العلوم الفيزيائية (أدبية)", "الفيزياء للأدبيين", "SECONDARY", s1, ["COMMON_LETTERS"]);

// Science
add("علوم الطبيعة والحياة", "العلوم الطبيعية", "SECONDARY", sAll, ["COMMON_SCIENCE", "EXPERIMENTAL_SCIENCES", "MATHEMATICS"]);
add("علوم الطبيعة والحياة (أدبية)", "العلوم للطبيعية للأدبيين", "SECONDARY", s1, ["COMMON_LETTERS"]);

// Philosophy
add("الفلسفة", "الفلسفة", "SECONDARY", s23, ["EXPERIMENTAL_SCIENCES", "MATHEMATICS", "TECHNICAL_MATH", "MANAGEMENT_ECONOMY", "LITERATURE_PHILOSOPHY", "FOREIGN_LANGUAGES"]);

// Management
add("التسيير المالي والمحاسبي", "المحاسبة", "SECONDARY", s23, ["MANAGEMENT_ECONOMY"]);
add("الاقتصاد والمانجمنت", "الاقتصاد", "SECONDARY", s23, ["MANAGEMENT_ECONOMY"]);
add("القانون", "القانون", "SECONDARY", s23, ["MANAGEMENT_ECONOMY"]);

// Technical
add("التكنولوجيا", "التكنولوجيا", "SECONDARY", s1, ["COMMON_SCIENCE"]);
add("الهندسة المدنية", "الهندسة المدنية", "SECONDARY", s23, ["TECHNICAL_MATH"]);
add("الهندسة الكهربائية", "الهندسة الكهربائية", "SECONDARY", s23, ["TECHNICAL_MATH"]);
add("الهندسة الميكانيكية", "الهندسة الميكانيكية", "SECONDARY", s23, ["TECHNICAL_MATH"]);
add("هندسة الطرائق", "هندسة الطرائق", "SECONDARY", s23, ["TECHNICAL_MATH"]);

// Languages
add("اللغة الإسبانية", "اللغة الإسبانية", "SECONDARY", s23, ["FOREIGN_LANGUAGES"]);
add("اللغة الألمانية", "اللغة الألمانية", "SECONDARY", s23, ["FOREIGN_LANGUAGES"]);
add("اللغة الإيطالية", "اللغة الإيطالية", "SECONDARY", s23, ["FOREIGN_LANGUAGES"]);

// Info
add("الإعلام الآلي", "الإعلام الآلي", "SECONDARY", s1, ["COMMON_SCIENCE", "COMMON_LETTERS"]);

fs.writeFileSync('./prisma/algerian-curriculum.json', JSON.stringify(subjects, null, 2));
console.log("Generated " + subjects.length + " complete subjects!");
