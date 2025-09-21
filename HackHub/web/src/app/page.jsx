import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Trophy,
  Users,
  Clock,
  Filter,
  Bookmark,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function HomePage() {
  const { data: user, loading: userLoading } = useUser();
  const [hackathons, setHackathons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all, online, offline
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const response = await fetch("/api/hackathons");
      if (!response.ok) {
        throw new Error(`Failed to fetch hackathons: ${response.status}`);
      }
      const data = await response.json();
      setHackathons(data);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesSearch =
      hackathon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.themes.some((theme) =>
        theme.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesMode = filterMode === "all" || hackathon.mode === filterMode;

    return matchesSearch && matchesMode;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HackHub</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Browse
              </a>
              <a href="/submit" className="text-gray-600 hover:text-gray-900">
                Submit Event
              </a>
              {!userLoading && user ? (
                <>
                  <a
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="w-4 h-4 inline mr-1" />
                    Admin
                  </a>
                  <a
                    href="/account/logout"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Sign Out
                  </a>
                </>
              ) : (
                <a
                  href="/account/signin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <User className="w-4 h-4 inline mr-1" />
                  Sign In
                </a>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4 pt-4">
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </a>
                <a
                  href="/submit"
                  className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Submit Event
                </a>
                {!userLoading && user ? (
                  <>
                    <a
                      href="/admin"
                      className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-lg hover:bg-gray-100 flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </a>
                    <a
                      href="/account/logout"
                      className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-lg hover:bg-gray-100 flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign Out
                    </a>
                  </>
                ) : (
                  <a
                    href="/account/signin"
                    className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-lg hover:bg-gray-100 flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </a>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Hackathons
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Find, explore, and participate in hackathons from around the world
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search hackathons by name, theme, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterMode === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilterMode("online")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterMode === "online"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setFilterMode("offline")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterMode === "offline"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                In-Person
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredHackathons.length} hackathons found
          </div>
        </div>
      </section>

      {/* Hackathons Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {hackathon.name}
                    </h3>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {hackathon.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(hackathon.start_date)} -{" "}
                      {formatDate(hackathon.end_date)}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {hackathon.mode === "online"
                        ? "Online"
                        : hackathon.location}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      Team size: {hackathon.min_team_size}-
                      {hackathon.max_team_size}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Trophy className="w-4 h-4 mr-2" />$
                      {hackathon.total_prizes.toLocaleString()} in prizes
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {hackathon.themes.slice(0, 3).map((theme, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {theme}
                      </span>
                    ))}
                    {hackathon.themes.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{hackathon.themes.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-1 text-orange-500" />
                      <span className="text-orange-600 font-medium">
                        {getDaysUntil(hackathon.start_date) > 0
                          ? `${getDaysUntil(hackathon.start_date)} days left`
                          : "Started"}
                      </span>
                    </div>

                    <a
                      href={hackathon.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Register
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredHackathons.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hackathons found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find more events.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
