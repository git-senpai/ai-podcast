import { useState } from "react";

interface VoiceSettings {
  numberOfSpeakers: number;
  speaker1Voice: string;
  speaker2Voice: string;
  format: "monologue" | "dialogue";
}

interface PodcastFormData {
  topic: string;
  subtopic: string;
  duration: number;
  voiceSettings: VoiceSettings;
  language: string;
}

const speakerOptions = [
  { value: 1, label: "Single Speaker" },
  { value: 2, label: "Two Speakers" },
];

const speaker1Voices = [
  { value: "jennifer", label: "Jennifer (English/American)" },
  { value: "rachel", label: "Rachel (English/British)" },
  { value: "emma", label: "Emma (English/Australian)" },
];

const speaker2Voices = [
  { value: "furio", label: "Furio (English/Italian)" },
  { value: "thomas", label: "Thomas (English/British)" },
  { value: "dave", label: "Dave (English/American)" },
];

const languageOptions = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish (Español)" },
  { value: "french", label: "French (Français)" },
  { value: "german", label: "German (Deutsch)" },
];

const durationOptions = [
  { value: 2, label: "2 minutes (Demo)" },
  { value: 5, label: "5 minutes (Short)" },
  { value: 10, label: "10 minutes (Standard)" },
  { value: 15, label: "15 minutes (Extended)" },
];

export default function PodcastForm({
  onSubmit,
}: {
  onSubmit: (data: PodcastFormData) => void;
}) {
  const [formData, setFormData] = useState<PodcastFormData>({
    topic: "",
    subtopic: "",
    duration: 5,
    voiceSettings: {
      numberOfSpeakers: 1,
      speaker1Voice: "jennifer",
      speaker2Voice: "furio",
      format: "monologue",
    },
    language: "english",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8"
      >
        {/* Topic Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Main Topic
              <span className="text-xs text-gray-400 block mt-1">
                Choose a clear, specific topic (e.g., &quot;Space
                Exploration&quot;, &quot;Healthy Eating&quot;)
              </span>
            </label>
            <input
              id="topic"
              type="text"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter your podcast topic"
              required
            />
          </div>
          <div>
            <label
              htmlFor="subtopic"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Specific Focus (Optional)
              <span className="text-xs text-gray-400 block mt-1">
                Narrow down your topic (e.g., &quot;Mars Colonization&quot;,
                &quot;Mediterranean Diet&quot;)
              </span>
            </label>
            <input
              id="subtopic"
              type="text"
              value={formData.subtopic}
              onChange={(e) =>
                setFormData({ ...formData, subtopic: e.target.value })
              }
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter a specific aspect to focus on"
            />
          </div>
        </div>

        {/* Voice Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="numberOfSpeakers"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Number of Speakers
            </label>
            <select
              id="numberOfSpeakers"
              value={formData.voiceSettings.numberOfSpeakers}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  voiceSettings: {
                    ...formData.voiceSettings,
                    numberOfSpeakers: parseInt(e.target.value),
                    format:
                      parseInt(e.target.value) > 1 ? "dialogue" : "monologue",
                  },
                })
              }
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
            >
              {speakerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="speaker1Voice"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Primary Speaker Voice
            </label>
            <select
              id="speaker1Voice"
              value={formData.voiceSettings.speaker1Voice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  voiceSettings: {
                    ...formData.voiceSettings,
                    speaker1Voice: e.target.value,
                  },
                })
              }
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
            >
              {speaker1Voices.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>

          {formData.voiceSettings.numberOfSpeakers > 1 && (
            <div>
              <label
                htmlFor="speaker2Voice"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Secondary Speaker Voice
              </label>
              <select
                id="speaker2Voice"
                value={formData.voiceSettings.speaker2Voice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    voiceSettings: {
                      ...formData.voiceSettings,
                      speaker2Voice: e.target.value,
                    },
                  })
                }
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
              >
                {speaker2Voices.map((voice) => (
                  <option key={voice.value} value={voice.value}>
                    {voice.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Duration
              <span className="text-xs text-gray-400 block mt-1">
                Choose podcast length
              </span>
            </label>
            <select
              id="duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Language
              <span className="text-xs text-gray-400 block mt-1">
                Choose podcast language
              </span>
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-medium 
            hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
        >
          Generate Professional Podcast
        </button>
      </form>
    </div>
  );
}
