function Heatmap({ data }) {
  const getColor = (total) => {
    if (total === 0) return "bg-gray-200";
    if (total < 3) return "bg-purple-200";
    if (total < 6) return "bg-purple-400";
    if (total < 10) return "bg-purple-600";

    return "bg-purple-800";
  };

  // transforma API em mapa
  const activityMap = {};

  data.forEach((day) => {
    activityMap[day.reviewed_at] = day.total;
  });

  // gera últimos 365 dias
  const days = [];

  for (let i = 364; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);

    const formatted = date.toISOString().split("T")[0];

    days.push({
      date: formatted,
      total: activityMap[formatted] || 0,
    });
  }

  return (
    <div className="flex flex-col items-center p-8">
      <h2 className="font-bold mb-4 text-xl">
        Atividade
      </h2>

      <div
        className="
          grid
          grid-rows-7
          grid-flow-col
          auto-cols-max
          gap-1
          overflow-x-auto
          p-2
        "
      >
        {days.map((day, index) => (
          <div
            key={index}
            title={`${day.date} - ${day.total} revisões`}
            className={`
              w-4 h-4
              rounded-[3px]
              transition-all
              duration-200
              hover:scale-125
              hover:ring-2
              hover:ring-purple-300
              hover:-translate-y-1
              ${getColor(day.total)}
            `}
          />
        ))}
      </div>
    </div>
  );
}

export default Heatmap;