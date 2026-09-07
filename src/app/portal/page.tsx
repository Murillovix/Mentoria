import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";

function sum(values: (number | null)[]) {
  return values.reduce((acc: number, v) => acc + (v ?? 0), 0);
}

export default async function PortalPage() {
  const user = await requireStudent();

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      mealPlans: {
        orderBy: { createdAt: "desc" },
        include: {
          meals: {
            orderBy: { order: "asc" },
            include: { items: { orderBy: { order: "asc" } } },
          },
        },
      },
      workoutPlans: {
        orderBy: { createdAt: "desc" },
        include: {
          days: {
            orderBy: { order: "asc" },
            include: { exercises: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (!student) {
    return <p>Seu perfil ainda não foi configurado. Fale com seu profissional.</p>;
  }

  const activeMealPlans = student.mealPlans.filter((p) => p.active);
  const otherMealPlans = student.mealPlans.filter((p) => !p.active);
  const activeWorkoutPlans = student.workoutPlans.filter((p) => p.active);
  const otherWorkoutPlans = student.workoutPlans.filter((p) => !p.active);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Olá, {(user.name ?? "").split(" ")[0]}
        </h1>
        {student.goal && (
          <p className="mt-1 text-black/60 dark:text-white/60">
            Objetivo: {student.goal}
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Plano alimentar</h2>
        {activeMealPlans.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            Nenhum plano alimentar ativo no momento.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {activeMealPlans.map((plan) => {
              const allItems = plan.meals.flatMap((m) => m.items);
              const totals = {
                calories: sum(allItems.map((i) => i.calories)),
                protein: sum(allItems.map((i) => i.protein)),
                carbs: sum(allItems.map((i) => i.carbs)),
                fat: sum(allItems.map((i) => i.fat)),
              };
              return (
                <div
                  key={plan.id}
                  className="rounded-lg border border-black/10 p-4 dark:border-white/15"
                >
                  <h3 className="font-medium">{plan.title}</h3>
                  {plan.notes && (
                    <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                      {plan.notes}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                    Total: {totals.calories} kcal · P {totals.protein}g · C{" "}
                    {totals.carbs}g · G {totals.fat}g
                  </p>

                  <div className="mt-4 flex flex-col gap-4">
                    {plan.meals.map((meal) => (
                      <div key={meal.id}>
                        <p className="font-medium">
                          {meal.name}
                          {meal.time && (
                            <span className="ml-2 text-sm font-normal text-black/50 dark:text-white/50">
                              {meal.time}
                            </span>
                          )}
                        </p>
                        <ul className="mt-1 flex flex-col gap-1">
                          {meal.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex flex-wrap justify-between gap-x-4 text-sm text-black/70 dark:text-white/70"
                            >
                              <span>
                                {item.foodName}
                                {item.quantity != null && (
                                  <>
                                    {" — "}
                                    {item.quantity}
                                    {item.unit ?? ""}
                                  </>
                                )}
                              </span>
                              {(item.calories ??
                                item.protein ??
                                item.carbs ??
                                item.fat) != null && (
                                <span className="text-black/50 dark:text-white/50">
                                  {item.calories ?? 0} kcal · P{" "}
                                  {item.protein ?? 0}g · C {item.carbs ?? 0}g ·
                                  G {item.fat ?? 0}g
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {otherMealPlans.length > 0 && (
          <details className="mt-4 text-sm text-black/60 dark:text-white/60">
            <summary className="cursor-pointer">Planos anteriores</summary>
            <ul className="mt-2 list-disc pl-5">
              {otherMealPlans.map((plan) => (
                <li key={plan.id}>{plan.title}</li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Plano de treino</h2>
        {activeWorkoutPlans.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            Nenhum plano de treino ativo no momento.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {activeWorkoutPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg border border-black/10 p-4 dark:border-white/15"
              >
                <h3 className="font-medium">{plan.title}</h3>
                {plan.notes && (
                  <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                    {plan.notes}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-4">
                  {plan.days.map((day) => (
                    <div key={day.id}>
                      <p className="font-medium">{day.name}</p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {day.exercises.map((exercise) => (
                          <li
                            key={exercise.id}
                            className="text-sm text-black/70 dark:text-white/70"
                          >
                            {exercise.name}
                            {exercise.sets != null && ` — ${exercise.sets}x`}
                            {exercise.reps ? `${exercise.reps}` : ""}
                            {exercise.weight ? ` · ${exercise.weight}` : ""}
                            {exercise.restSeconds != null &&
                              ` · descanso ${exercise.restSeconds}s`}
                            {exercise.notes && (
                              <span className="block text-black/50 dark:text-white/50">
                                {exercise.notes}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {otherWorkoutPlans.length > 0 && (
          <details className="mt-4 text-sm text-black/60 dark:text-white/60">
            <summary className="cursor-pointer">Planos anteriores</summary>
            <ul className="mt-2 list-disc pl-5">
              {otherWorkoutPlans.map((plan) => (
                <li key={plan.id}>{plan.title}</li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}
