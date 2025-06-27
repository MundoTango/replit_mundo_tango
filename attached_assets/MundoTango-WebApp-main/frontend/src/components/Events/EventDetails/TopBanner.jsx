import { formatDateMonth, formatTime } from "@/utils/helper";

const TopBanner = ({ event }) => {
  return (
    <section className="relative p-5 space-y-2 rounded-t-xl flex items-end h-[290px]"
    style={{
        backgroundImage: `
          linear-gradient(180deg, rgba(9, 21, 34, 0) 25.87%, #091522 88.88%), 
          url(${event?.image_url})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="w-full h-[80px] space-y-2">
          <div className="text-white text-sm">Starts From: <span className="font-bold">{formatDateMonth(event?.start_date || '')} at {formatTime(event?.start_date || '')}</span></div>
          <div className="text-white">
            <p className="font-bold text-lg capitalize">{event?.name}</p>
            <div className="flex items-center gap-1">
              <img src="/images/location.svg" />
              <p>{event?.city}</p>
            </div>
          </div>
        </div>
    </section>
  );
};

export default TopBanner;