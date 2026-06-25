import type { CardCourse } from '@/types/chatbot.types';

interface Props {
  course: CardCourse;
  onSelect: (course: CardCourse) => void;
}

export function CourseCard({ course, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-clay-card border border-border/30 hover:shadow-md transition-shadow duration-200">
      <img
        src={course.imageUrl}
        alt={course.name}
        className="w-full h-28 object-cover"
        loading="lazy"
      />
      <div className="p-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9972C]">
          {course.segment}
        </span>
        <h4 className="text-sm font-semibold text-foreground mt-0.5 line-clamp-2 leading-snug">
          {course.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-bold text-cee-red">
            S/ {course.price.toFixed(2)}
          </span>
          <button
            onClick={() => onSelect(course)}
            className="text-xs font-medium text-white bg-cee-red hover:bg-cee-red-light px-3 py-1.5 rounded-lg transition-colors"
          >
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
}
