import { formatTime } from '@/utils/helper'
import React from 'react'

const EventAboutDetails = ({event}) => {
console.log(event)
  return (
    <div className='main_card'>
        <h2 className="font-[700] text-[20px] ">Event Details </h2>
        <div className='flex flex-col gap-2 mt-3 text-[#64748B] font-[600]'>
        <div className="flex items-center gap-3">
              <img src="/images/event/event_prof.png" />
              <p>Event by {event?.user?.username}</p>
        </div>
        <div className="flex items-center gap-3">
              <img src="/images/event/event_home.png" />
              <p>{event?.location}</p>
        </div>
        <div className="flex items-center gap-3">
              <img src="/images/event/event_location.png" />
              <p>{event?.country}</p>
        </div>
        <div className="flex items-center gap-3">
              <img src="/images/event/event_type.png" />
              <p>Type of Tango event: {event?.user?.event_type}</p>
        </div>
        <div className="flex items-center gap-3">
              <img src="/images/event/event_type.png" />
              <p>Duration: {formatTime(event?.start_date || '')} to {formatTime(event?.end_date || '')}</p>
        </div>
        <div className="flex items-center gap-3">
              <img src="/images/event/event_public.png" />
              <p>{event?.visibility === 'public' ? 'Public Anyone on or off “Mundo Tango”' : event?.visibility}</p>
        </div>
        </div>
        {/* {event?.event_activities?.map((x) => (
            <div key={x.id} className="flex items-center gap-3 mt-3 text-[#64748B] font-[600]">
              <p>Non-tango activites: </p>
                <img src={x?.non_tango_activity?.icon_url} width={20}/>
            </div>
        ))} */}
        <p className='mt-3 max-w-[650px] text-[#64748B] font-[600]'>
            {event?.description}
        </p>
        
    </div>
  )
}

export default EventAboutDetails