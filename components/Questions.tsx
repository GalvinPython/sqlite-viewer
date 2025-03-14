const Questions: React.FC = () => {
    return (
        <div className="flex justify-center mb-12">
            <div
                className="w-full max-w-6xl p-6 shadow rounded-lg"
                style={{
                    backgroundColor: "var(--upload-box-bg)",
                }}
            >
                {[
                    {
                        title: "How does it work?",
                        content:
                            "When you upload your SQLite file, it gets processed locally on your device and is stored in RAM. It then reads the data of the database and visualizes it in the browser.",
                    },
                    {
                        title: "Do my files get saved?",
                        content:
                            'Nope, it\'s all locally done! A reminder that the site is open source, so you can view the code! Click the "View on GitHub" button to see more.',
                    },
                    {
                        title: "A reminder about large files",
                        content:
                            "As the database gets visualised in the browser, it can be a bit slow with large files. Please be patient! Of course the site is limited by your system performance, so if you're on a potato, it's gonna be slow.",
                    },
                    {
                        title: "I found a bug!",
                        content:
                            "There's a link to the GitHub repo above. Please open an issue there!",
                    },
                ].map((section, index) => (
                    <div key={index}>
                        <h2 className="text-lg font-semibold mb-4">
                            {section.title}
                        </h2>
                        <p className="mb-4">{section.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Questions;
