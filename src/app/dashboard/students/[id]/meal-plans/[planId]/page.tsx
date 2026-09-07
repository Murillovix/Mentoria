import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  createMeal,
  createMealItem,
  deleteMeal,
  deleteMealItem,
  deleteMealPlan,
  toggleMealPlanActive,
  updateMeal,
  updateMealItem,
  updateMealPlanMeta,
} from "../actions";

function sum(values: (number | null)[]) {
  return values.reduce((acc: number, v) => acc + (v ?? 0), 0);
}

const inputClass =
  "rounded-md border border-black/10 px-2 py-1 text-sm outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40";
const itemGridClass =
  "grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[2fr_70px_70px_70px_70px_70px_70px_auto] sm:items-center";

export default async function MealPlanPage({
  params,
}: {
  params: Promise<{ id: string; planId: string }>;
}) {
  const professional = await requireProfessional();
  const { id: studentId, planId } = await params;

  const plan = await prisma.mealPlan.findUnique({
    where: { id: planId },
    include: {
      student: { include: { user: true } },
      meals: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (
    !plan ||
    plan.studentId !== studentId ||
    plan.student.professionalId !== professional.id
  ) {
    notFound();
  }

  const allItems = plan.meals.flatMap((meal) => meal.items);
  const planTotals = {
    calories: sum(allItems.map((i) => i.calories)),
    protein: sum(allItems.map((i) => i.protein)),
    carbs: sum(allItems.map((i) => i.carbs)),
    fat: sum(allItems.map((i) => i.fat)),
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/dashboard/students/${studentId}`}
          className="mb-4 inline-block text-sm text-black/60 underline underline-offset-2 dark:text-white/60"
        >
          ← Voltar para {plan.student.user.name}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <form
            action={updateMealPlanMeta.bind(null, planId)}
            className="flex min-w-[240px] flex-1 flex-col gap-2"
          >
            <input
              name="title"
              defaultValue={plan.title}
              className="border-b border-transparent bg-transparent text-2xl font-semibold outline-none focus:border-black/20 dark:focus:border-white/30"
            />
            <textarea
              name="notes"
              defaultValue={plan.notes ?? ""}
              placeholder="Observações do plano"
              rows={2}
              className={inputClass}
            />
            <button
              type="submit"
              className="w-fit text-sm underline underline-offset-2"
            >
              Salvar título/observações
            </button>
          </form>

          <div className="flex flex-col items-end gap-2">
            <form action={toggleMealPlanActive.bind(null, planId)}>
              <button
                type="submit"
                className="text-sm underline underline-offset-2"
              >
                {plan.active ? "Marcar inativo" : "Marcar ativo"}
              </button>
            </form>
            <form action={deleteMealPlan.bind(null, planId)}>
              <button
                type="submit"
                className="text-sm text-red-600 underline underline-offset-2 dark:text-red-400"
              >
                Excluir plano
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MacroCard label="Calorias" value={planTotals.calories} unit="kcal" />
        <MacroCard label="Proteína" value={planTotals.protein} unit="g" />
        <MacroCard label="Carboidrato" value={planTotals.carbs} unit="g" />
        <MacroCard label="Gordura" value={planTotals.fat} unit="g" />
      </div>

      <div className="flex flex-col gap-6">
        {plan.meals.map((meal) => {
          const mealTotals = {
            calories: sum(meal.items.map((i) => i.calories)),
            protein: sum(meal.items.map((i) => i.protein)),
            carbs: sum(meal.items.map((i) => i.carbs)),
            fat: sum(meal.items.map((i) => i.fat)),
          };

          return (
            <div
              key={meal.id}
              className="rounded-lg border border-black/10 dark:border-white/15"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/15">
                <form
                  action={updateMeal.bind(null, meal.id)}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    name="name"
                    defaultValue={meal.name}
                    className="border-b border-transparent bg-transparent font-medium outline-none focus:border-black/20 dark:focus:border-white/30"
                  />
                  <input
                    name="time"
                    type="time"
                    defaultValue={meal.time ?? ""}
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    className="text-xs underline underline-offset-2"
                  >
                    Salvar
                  </button>
                </form>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {mealTotals.calories} kcal · P {mealTotals.protein}g · C{" "}
                    {mealTotals.carbs}g · G {mealTotals.fat}g
                  </span>
                  <form action={deleteMeal.bind(null, meal.id)}>
                    <button
                      type="submit"
                      className="text-xs text-red-600 underline underline-offset-2 dark:text-red-400"
                    >
                      Excluir refeição
                    </button>
                  </form>
                </div>
              </div>

              <div className="hidden gap-2 border-b border-black/5 px-4 py-2 text-xs font-medium text-black/50 sm:grid sm:grid-cols-[2fr_70px_70px_70px_70px_70px_70px_auto] dark:border-white/10 dark:text-white/50">
                <span>Alimento</span>
                <span>Qtd</span>
                <span>Unid.</span>
                <span>Kcal</span>
                <span>Prot.</span>
                <span>Carb.</span>
                <span>Gord.</span>
                <span />
              </div>

              <div className="flex flex-col">
                {meal.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 border-t border-black/5 px-4 py-2 sm:flex-row sm:items-center dark:border-white/10"
                  >
                    <form
                      action={updateMealItem.bind(null, item.id)}
                      className={itemGridClass}
                    >
                      <input
                        name="foodName"
                        defaultValue={item.foodName}
                        className={`${inputClass} col-span-2 sm:col-span-1`}
                      />
                      <input
                        name="quantity"
                        type="number"
                        step="any"
                        defaultValue={item.quantity ?? ""}
                        className={inputClass}
                      />
                      <input
                        name="unit"
                        defaultValue={item.unit ?? ""}
                        className={inputClass}
                      />
                      <input
                        name="calories"
                        type="number"
                        step="any"
                        defaultValue={item.calories ?? ""}
                        className={inputClass}
                      />
                      <input
                        name="protein"
                        type="number"
                        step="any"
                        defaultValue={item.protein ?? ""}
                        className={inputClass}
                      />
                      <input
                        name="carbs"
                        type="number"
                        step="any"
                        defaultValue={item.carbs ?? ""}
                        className={inputClass}
                      />
                      <input
                        name="fat"
                        type="number"
                        step="any"
                        defaultValue={item.fat ?? ""}
                        className={inputClass}
                      />
                      <button
                        type="submit"
                        className="w-fit text-xs underline underline-offset-2"
                      >
                        Salvar
                      </button>
                    </form>
                    <form action={deleteMealItem.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-600 underline underline-offset-2 dark:text-red-400"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              <form
                action={createMealItem.bind(null, meal.id)}
                className="flex flex-col gap-2 border-t border-black/10 px-4 py-3 sm:flex-row sm:items-center dark:border-white/15"
              >
                <div className={itemGridClass}>
                  <input
                    name="foodName"
                    placeholder="Alimento"
                    required
                    className={`${inputClass} col-span-2 sm:col-span-1`}
                  />
                  <input
                    name="quantity"
                    type="number"
                    step="any"
                    placeholder="Qtd"
                    className={inputClass}
                  />
                  <input
                    name="unit"
                    placeholder="Unid."
                    className={inputClass}
                  />
                  <input
                    name="calories"
                    type="number"
                    step="any"
                    placeholder="Kcal"
                    className={inputClass}
                  />
                  <input
                    name="protein"
                    type="number"
                    step="any"
                    placeholder="Prot."
                    className={inputClass}
                  />
                  <input
                    name="carbs"
                    type="number"
                    step="any"
                    placeholder="Carb."
                    className={inputClass}
                  />
                  <input
                    name="fat"
                    type="number"
                    step="any"
                    placeholder="Gord."
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    className="w-fit text-xs font-medium underline underline-offset-2"
                  >
                    + Adicionar
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>

      <form
        action={createMeal.bind(null, planId)}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-black/20 p-4 dark:border-white/20"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nova refeição</label>
          <input
            name="name"
            required
            placeholder="Ex: Café da manhã"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Horário</label>
          <input name="time" type="time" className={inputClass} />
        </div>
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Adicionar refeição
        </button>
      </form>
    </div>
  );
}

function MacroCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/15">
      <p className="text-xs text-black/50 dark:text-white/50">{label}</p>
      <p className="text-lg font-semibold">
        {value}
        <span className="ml-1 text-sm font-normal text-black/50 dark:text-white/50">
          {unit}
        </span>
      </p>
    </div>
  );
}
