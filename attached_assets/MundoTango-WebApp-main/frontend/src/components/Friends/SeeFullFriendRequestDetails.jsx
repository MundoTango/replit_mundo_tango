import { formatDateMonth } from "@/utils/helper";

const SeeFullFriendRequestDetails = ({ record }) => {
  const selectedBox =
    "bg-background-color py-4 px-2 text-sm text-[#949393] rounded-xl outline-none w-full"; // Dropdown box styling

  // const [getFriendShipCard, { isLoading }] = useGetFriendShipCardMutation();

  // const [record, setRecord] = useState({
  //   have_we_danced: false,
  //   event_we_meet: "",
  //   city_we_meet: "",
  //   when_did_we_meet: "",
  //   sender_notes: "",
  //   receiver_notes: "",
  //   attachments: [],
  // });

  // useEffect(() => {
  //   getFriendDetails();
  // }, []);

  // const getFriendDetails = async () => {
  //   try {
  //     const result = await getFriendShipCard(ProfileId);
  //     const { code, data } = result?.data;

  //     if (code) {
  //       // console.log(data?.have_we_danced);
  //       // console.log(data?.event_we_meet);
  //       // console.log(data?.city_we_meet);
  //       // console.log(data?.when_did_we_meet);
  //       // console.log(data?.sender_notes);
  //       // console.log(data?.receiver_notes);
  //       // console.log(data?.attachments);

  //       setRecord({
  //         have_we_danced: data?.have_we_danced,
  //         event_we_meet: data?.event_we_meet,
  //         city_we_meet: data?.city_we_meet,
  //         when_did_we_meet: data?.when_did_we_meet,
  //         sender_notes: data?.sender_notes,
  //         receiver_notes: data?.receiver_notes,
  //         attachments: data?.attachments,
  //       });
  //     }
  //   } catch (e) {
  //     console.log(e.message);
  //   }
  // };

  return (
    <div className="card">
      <div className="mb-2 flex justify-between">
        <h2>Friend request details</h2>
      </div>

      <div className="mr-4">
        <div className="flex flex-col items-center gap-3">
          <input
            disabled
            className={selectedBox}
            placeholder="Have we danced?"
            value={record?.have_we_danced}
          />
          <input
            disabled
            className={selectedBox}
            placeholder="When did we meet"
            value={record?.event_we_meet}
          />
          <input
            disabled
            className={selectedBox}
            placeholder="Which city did we meet in"
            value={record?.city_we_meet}
          />
          <input
            disabled
            className={selectedBox}
            placeholder="Did we meet at an event? Which one"
            value={formatDateMonth(record?.when_did_we_meet)}
          />
        </div>

        <div className="py-5">
          <hr />
        </div>

        <div>
          <div className="text-gray-text-color text-sm font-bold">
            Why do you want to connect? Did we have an interesting conversation
            topic, did we go on an adventure, etc
          </div>

          <textarea
            disabled
            className="bg-background-color w-full rounded-lg resize-none h-24 outline-none mt-4 text-gray-text-color p-3 text-sm font-medium"
            value={record?.sender_notes}
          ></textarea>
        </div>

        <div className="mt-3">
          <h2>Any Photos</h2>
          {!!record?.attachments?.length && (
            <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap lg:gap-0 ">
              {record?.attachments?.map(({ media_url, media_type }, i) => (
                <div key={i}>
                  {media_type === "image" ? (
                    <img
                      className="object-contain max-w-72 min-w-52 mb-3 pr-2 rounded-xl"
                      loading="lazy"
                      src={media_url}
                    />
                  ) : media_type === "video" ? (
                    <video
                      className="object-contain max-w-80 mb-3 pr-2 rounded-xl"
                      controls
                    >
                      <source src={media_url} />
                    </video>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeeFullFriendRequestDetails;
