import React, { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  isSameMonth,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope, 
  RefreshCw 
} from "lucide-react";
import { Appointment } from "../types";

interface CalendarViewProps {
  appointments: Appointment[];
  onRefresh: () => Promise<void>;
  onSelectDayForBooking?: (date: string) => void;
}

export function CalendarView({ appointments, onRefresh, onSelectDayForBooking }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      if (!apt.scheduledAt) return false;
      try {
        const aptDate = new Date(apt.scheduledAt);
        return isSameDay(aptDate, date);
      } catch (e) {
        return false;
      }
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-sky-50 text-sky-700 border-sky-100",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      in_progress: "bg-amber-50 text-amber-700 border-amber-100 animate-pulse",
      completed: "bg-slate-100 text-slate-700 border-slate-200",
      cancelled: "bg-rose-50 text-rose-700 border-rose-100",
      no_show: "bg-indigo-50 text-indigo-700 border-indigo-100"
    };
    return colors[status] || "bg-slate-50 text-slate-700 border-slate-100";
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
    if (selectedDate) {
      const newSelected = new Date(selectedDate);
      newSelected.setDate(newSelected.getDate() + direction * 7);
      setSelectedDate(newSelected);
    }
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
    if (selectedDate) {
      const newSelected = new Date(selectedDate);
      newSelected.setDate(newSelected.getDate() + direction);
      setSelectedDate(newSelected);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase py-3 tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[1px] bg-slate-100">
          {days.map(day => {
            const dayAppointments = getAppointmentsForDay(day);
            const isTodayDate = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentDate(day);
                }}
                className={`min-h-24 bg-white p-2.5 cursor-pointer hover:bg-slate-50/80 transition-all flex flex-col justify-between group ${
                  isTodayDate ? "ring-2 ring-sky-500/10 bg-sky-50/10" : ""
                } ${isSelected ? "bg-sky-50/30 font-bold" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black px-1.5 py-0.5 rounded-lg ${
                    isTodayDate 
                      ? "bg-sky-500 text-white shadow-sm" 
                      : isSelected 
                        ? "text-sky-600 bg-sky-100/60" 
                        : isCurrentMonth 
                          ? "text-slate-700" 
                          : "text-slate-300"
                  }`}>
                    {format(day, "d")}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="bg-slate-100 text-slate-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>
                
                <div className="mt-2 space-y-1 overflow-y-auto max-h-16 pr-0.5 scrollbar-thin">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      className="text-[9px] truncate px-1.5 py-0.5 rounded border leading-snug font-semibold text-slate-700 bg-slate-50 border-slate-100 hover:border-sky-200 transition-colors"
                      title={`${format(new Date(apt.scheduledAt), "hh:mm a")} - ${apt.patientName}`}
                    >
                      <span className="text-sky-500 font-extrabold mr-1">
                        {format(new Date(apt.scheduledAt), "HH:mm")}
                      </span>
                      {apt.patientName}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-[8px] text-slate-400 font-bold text-center">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {days.map(day => {
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            return (
              <div 
                key={day.toISOString()} 
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentDate(day);
                }}
                className={`text-center py-4 cursor-pointer hover:bg-slate-50 transition-all ${
                  isSelected ? "bg-sky-50/20 border-b-2 border-sky-500" : ""
                }`}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(day, "eee")}</p>
                <p className={`text-base font-black mt-1 mx-auto w-8 h-8 flex items-center justify-center rounded-full ${
                  isTodayDate 
                    ? "bg-sky-500 text-white" 
                    : isSelected 
                      ? "text-sky-600 bg-sky-100/60" 
                      : "text-slate-800"
                }`}>
                  {format(day, "d")}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-4 grid grid-cols-7 gap-4 min-h-[300px]">
          {days.map(day => {
            const dayAppointments = getAppointmentsForDay(day);
            return (
              <div key={day.toISOString()} className="space-y-2 border-r border-slate-50 last:border-0 pr-2">
                {dayAppointments.length === 0 ? (
                  <p className="text-[9px] text-slate-300 font-bold text-center py-10">No appts</p>
                ) : (
                  dayAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="p-2 rounded-xl border bg-slate-50/50 border-slate-100 hover:border-sky-100 transition-all text-left"
                    >
                      <p className="text-[9px] font-black text-sky-600">{format(new Date(apt.scheduledAt), "hh:mm a")}</p>
                      <p className="text-[11px] font-extrabold text-slate-800 truncate mt-0.5">{apt.patientName}</p>
                      <p className="text-[9px] text-slate-400 font-semibold truncate">Dr. {apt.doctorName.split(" ").pop()}</p>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const focusDate = selectedDate || currentDate;
    const dayAppointments = getAppointmentsForDay(focusDate);
    const sortedAppointments = [...dayAppointments].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-sky-500" /> {format(focusDate, "EEEE, d MMMM yyyy")}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Appointments scheduled: {sortedAppointments.length}
            </p>
          </div>
          {onSelectDayForBooking && (
            <button
              onClick={() => onSelectDayForBooking(format(focusDate, "yyyy-MM-dd"))}
              className="py-1.5 px-3 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl text-[10px] font-black transition-all cursor-pointer border-0"
            >
              + Quick Book For This Day
            </button>
          )}
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="font-bold text-sm">No appointments scheduled</p>
            <p className="text-xs mt-1">Select another day or click book above to create one.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {sortedAppointments.map(apt => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-sky-100 bg-slate-50/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl shadow-sm text-center min-w-[70px]">
                    <p className="text-xs font-black text-slate-800">
                      {format(new Date(apt.scheduledAt), "hh:mm")}
                    </p>
                    <p className="text-[8px] font-bold text-sky-500 uppercase tracking-wider mt-0.5">
                      {format(new Date(apt.scheduledAt), "a")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800">{apt.patientName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
                        <Stethoscope className="h-3 w-3 text-sky-500" /> Dr. {apt.doctorName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">|</span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        Type: <span className="uppercase text-slate-600">{apt.type}</span>
                      </span>
                    </div>
                    {apt.reason && (
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-md italic mt-0.5">
                        "{apt.reason}"
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const selectedDayAppointments = selectedDate ? getAppointmentsForDay(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-1.5">
              📅 Scheduler Calendar
            </h2>
            <span className="bg-sky-100 text-sky-800 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase">
              {appointments.length} Appointments Total
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Manage, schedule, and view upcoming slots with absolute time-slot precision.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-black border-0"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          
          <div className="flex items-center bg-slate-50 border border-slate-150 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => {
                if (viewMode === "month") navigateMonth(-1);
                else if (viewMode === "week") navigateWeek(-1);
                else navigateDay(-1);
              }}
              className="p-1 hover:bg-white rounded-xl transition-all cursor-pointer border-0"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <span className="text-xs font-black text-slate-700 min-w-[120px] text-center px-2">
              {viewMode === "month" 
                ? format(currentDate, "MMMM yyyy") 
                : viewMode === "week"
                  ? `Week of ${format(startOfWeek(currentDate), "d MMM")}`
                  : format(currentDate, "d MMMM yyyy")
              }
            </span>
            <button
              onClick={() => {
                if (viewMode === "month") navigateMonth(1);
                else if (viewMode === "week") navigateWeek(1);
                else navigateDay(1);
              }}
              className="p-1 hover:bg-white rounded-xl transition-all cursor-pointer border-0"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black rounded-2xl transition-all cursor-pointer border-0 shadow-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* VIEW SELECTION TAB BAR */}
      <div className="bg-white rounded-3xl p-1.5 border border-slate-100 shadow-sm flex max-w-xs gap-1">
        <button
          onClick={() => setViewMode("month")}
          className={`flex-1 py-2 rounded-2xl text-[10px] font-black transition-all cursor-pointer border-0 ${
            viewMode === "month"
              ? "bg-sky-500 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Month View
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`flex-1 py-2 rounded-2xl text-[10px] font-black transition-all cursor-pointer border-0 ${
            viewMode === "week"
              ? "bg-sky-500 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Week View
        </button>
        <button
          onClick={() => {
            setViewMode("day");
            if (!selectedDate) setSelectedDate(new Date());
          }}
          className={`flex-1 py-2 rounded-2xl text-[10px] font-black transition-all cursor-pointer border-0 ${
            viewMode === "day"
              ? "bg-sky-500 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Day View
        </button>
      </div>

      {/* CALENDAR BODY */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className={viewMode === "month" ? "xl:col-span-8 space-y-6" : "xl:col-span-12 space-y-6"}>
          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </div>

        {/* SIDEBAR FOR SELECTED DAY DETAIL (ONLY IN MONTH/WEEK VIEW FOR SYNERGY) */}
        {viewMode !== "day" && (
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Selected Day Details</span>
                <h3 className="font-extrabold text-slate-800 text-sm mt-1">
                  {selectedDate ? format(selectedDate, "EEEE, d MMM yyyy") : format(currentDate, "EEEE, d MMM yyyy")}
                </h3>
              </div>

              {selectedDayAppointments.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50/40 rounded-2xl border border-dashed border-slate-150">
                  <p className="font-bold text-xs">No Scheduled Slots</p>
                  <p className="text-[10px] mt-0.5">Click any day to view or book.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {selectedDayAppointments.map(apt => (
                    <div 
                      key={apt.id}
                      className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-sky-100 transition-all text-left space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                          {format(new Date(apt.scheduledAt), "hh:mm a")}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{apt.patientName}</p>
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5 mt-0.5">
                          <Stethoscope className="h-3 w-3 text-sky-500" /> Dr. {apt.doctorName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {onSelectDayForBooking && selectedDate && (
                <button
                  onClick={() => onSelectDayForBooking(format(selectedDate, "yyyy-MM-dd"))}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-black py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border-0"
                >
                  📅 Book Appointment
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* LEGEND BAR */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-wrap gap-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-sky-500 rounded-full"></span>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}
