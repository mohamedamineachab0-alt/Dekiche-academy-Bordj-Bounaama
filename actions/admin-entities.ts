"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Role, Phase, Level, Stream, Wilaya } from "@/generated/prisma";

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, role: true },
  });
  
  if (!user || user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }
  return user.id;
}

export async function getEntityOptions() {
  await requireAdmin();
  const subjects = await prisma.subject.findMany({ select: { id: true, title: true, levels: true, streams: true } });
  const teachers = await prisma.teacher.findMany({ select: { id: true, name: true } });
  const groups = await prisma.group.findMany({
    include: { subject: { select: { title: true, levels: true, streams: true } }, teacher: { select: { name: true } } }
  });
  
  return { subjects, teachers, groups };
}

export async function getEntityLists() {
  await requireAdmin();
  
  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    include: {
      studentProfile: true,
      enrollments: { include: { subject: true, group: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  
  const groups = await prisma.group.findMany({
    include: { subject: true, teacher: true, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" }
  });
  
  return { students, groups };
}


export async function addEmployee(formData: FormData) {
  try {
    await requireAdmin();
    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    
    await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        role: Role.EMPLOYEE,
      }
    });
    
    revalidatePath("/dashboard/admin/school");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTeacher(formData: FormData) {
  try {
    await requireAdmin();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    
    const user = await prisma.user.create({
      data: {
        fullName: name,
        phoneNumber: phone,
        role: Role.TEACHER,
      }
    });
    
    await prisma.teacher.create({
      data: {
        userId: user.id,
        name,
        phone,
      }
    });
    
    revalidatePath("/dashboard/admin/school");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addSubject(formData: FormData) {
  try {
    await requireAdmin();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const teacherName = formData.get("teacherName") as string;
    
    await prisma.subject.create({
      data: {
        title,
        description,
        teacherName,
        price: isNaN(price) ? 0 : price,
        accessType: "MONTHLY",
        image: "https://via.placeholder.com/300", // default placeholder
      }
    });
    
    revalidatePath("/dashboard/admin/school");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addGroup(formData: FormData) {
  try {
    await requireAdmin();
    const name = formData.get("name") as string;
    const subjectId = formData.get("subjectId") as string;
    const teacherId = formData.get("teacherId") as string;
    const level = formData.get("level") as Level;
    
    await prisma.group.create({
      data: {
        name,
        subjectId,
        teacherId: teacherId || null,
        level: level || "SECONDARY_1"
      }
    });
    
    revalidatePath("/dashboard/admin/school");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addStudent(formData: FormData) {
  try {
    await requireAdmin();
    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const parentName = formData.get("parentName") as string;
    const parentPhone = formData.get("parentPhone") as string;
    const groupId = formData.get("groupId") as string;
    
    const user = await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        role: Role.STUDENT,
      }
    });
    
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        parentName,
        parentPhone,
        level: "SECONDARY_1", // Default, can be extended
        stream: "NONE",
        wilaya: Wilaya.W16, // Default
      }
    });

    if (groupId) {
      const group = await prisma.group.findUnique({ where: { id: groupId } });
      if (group) {
        await prisma.enrollment.create({
          data: {
            studentId: user.id,
            subjectId: group.subjectId,
            groupId: group.id,
          }
        });
      }
    }
    
    revalidatePath("/dashboard/admin/school");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function importStudentsCSV(studentsData: any[]) {
  try {
    await requireAdmin();
    
    for (const data of studentsData) {
      if (!data.fullName || !data.phoneNumber) continue;
      
      const user = await prisma.user.create({
        data: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          role: Role.STUDENT,
        }
      });
      
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          parentName: data.parentName || "غير معروف",
          parentPhone: data.parentPhone || "غير معروف",
          level: data.level || "SECONDARY_1",
          stream: "NONE",
          wilaya: Wilaya.W16,
        }
      });

      if (data.groupId) {
        const group = await prisma.group.findUnique({ where: { id: data.groupId } });
        if (group) {
          await prisma.enrollment.create({
            data: {
              studentId: user.id,
              subjectId: group.subjectId,
              groupId: group.id,
            }
          });
        }
      }
    }
    
    revalidatePath("/dashboard/admin/school");
    return { success: true, count: studentsData.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

