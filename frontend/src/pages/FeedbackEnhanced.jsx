import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Star,
    Send,
    MessageCircle,
    CheckCircle,
    Calendar,
    Scissors,
    Award,
    Users,
    Sparkles,
    DollarSign,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { appointmentService, feedbackService } from "../services/dataService";
import toast from "react-hot-toast";
import { format } from "date-fns";

const Feedback = () => {
    const { user } = useAuth();
    const [completedAppointments, setCompletedAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Overall rating
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    // Detailed service ratings
    const [serviceQualityRating, setServiceQualityRating] = useState(0);
    const [staffFriendlinessRating, setStaffFriendlinessRating] = useState(0);
    const [cleanlinessRating, setCleanlinessRating] = useState(0);
    const [valueForMoneyRating, setValueForMoneyRating] = useState(0);

    const [comments, setComments] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCompletedAppointments();
        }
    }, [user]);

    const fetchCompletedAppointments = async () => {
        try {
            const response = await appointmentService.getAll();
            const appointments = response.data || response || [];

            // Filter completed appointments without feedback
            const completed = appointments.filter(
                (apt) =>
                    apt.status === "Completed" &&
                    apt.client_id === user?.id &&
                    !apt.has_feedback,
            );

            setCompletedAppointments(completed);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error("Unable to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();

        if (!selectedAppointment) {
            toast.error("Please select an appointment");
            return;
        }

        if (rating === 0) {
            toast.error("Please select an overall rating");
            return;
        }

        if (!comments.trim()) {
            toast.error("Please write your feedback");
            return;
        }

        setSubmitting(true);

        try {
            await feedbackService.create({
                appointment_id: selectedAppointment.id,
                rating: rating,
                service_quality_rating: serviceQualityRating || null,
                staff_friendliness_rating: staffFriendlinessRating || null,
                cleanliness_rating: cleanlinessRating || null,
                value_for_money_rating: valueForMoneyRating || null,
                comments: comments.trim(),
            });

            toast.success("Thank you for your detailed feedback!");

            // Reset form
            setSelectedAppointment(null);
            setRating(0);
            setServiceQualityRating(0);
            setStaffFriendlinessRating(0);
            setCleanlinessRating(0);
            setValueForMoneyRating(0);
            setComments("");

            // Refresh appointments
            fetchCompletedAppointments();
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to submit feedback";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const StarRatingComponent = ({ value, setValue, size = 40, label }) => {
        const [hover, setHover] = useState(0);

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-zen-700">
                        {label}
                    </label>
                )}
                <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setValue(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="focus:outline-none"
                        >
                            <Star
                                size={size}
                                className={`transition-colors ${
                                    star <= (hover || value)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-zen-300"
                                }`}
                            />
                        </motion.button>
                    ))}
                    {value > 0 && (
                        <span className="text-sm text-zen-600 ml-2">
                            {value === 1 && "Poor"}
                            {value === 2 && "Fair"}
                            {value === 3 && "Good"}
                            {value === 4 && "Very Good"}
                            {value === 5 && "Excellent"}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cream via-zen-50 to-stone flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-zen-600 mx-auto mb-4"></div>
                    <p className="text-zen-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream via-zen-50 to-stone py-12">
            <div className="container-zen">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-zen-600 rounded-full mb-4">
                        <MessageCircle className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-zen font-bold text-zen-800 mb-4">
                        Share Your Experience
                    </h1>
                    <p className="text-zen-600 text-lg max-w-2xl mx-auto">
                        We'd love to hear about your experience with our
                        services. Your feedback helps us improve!
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Completed Appointments List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="card-zen">
                            <div className="flex items-center mb-6">
                                <Calendar
                                    className="text-zen-600 mr-3"
                                    size={24}
                                />
                                <h2 className="text-2xl font-zen font-bold text-zen-800">
                                    Your Completed Services
                                </h2>
                            </div>

                            {completedAppointments.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle
                                        className="text-zen-300 mx-auto mb-4"
                                        size={64}
                                    />
                                    <p className="text-zen-600 text-lg mb-2">
                                        No completed appointments
                                    </p>
                                    <p className="text-zen-500">
                                        Complete a service to leave feedback
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {completedAppointments.map(
                                        (appointment) => (
                                            <motion.div
                                                key={appointment.id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() =>
                                                    setSelectedAppointment(
                                                        appointment,
                                                    )
                                                }
                                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                    selectedAppointment?.id ===
                                                    appointment.id
                                                        ? "border-zen-600 bg-zen-50 shadow-md"
                                                        : "border-zen-200 hover:border-zen-400"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <Scissors
                                                                className="text-zen-600 mr-2"
                                                                size={18}
                                                            />
                                                            <h3 className="font-semibold text-zen-800">
                                                                Appointment #
                                                                {appointment.id}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm text-zen-600 mb-1">
                                                            Date:{" "}
                                                            {format(
                                                                new Date(
                                                                    appointment.appointment_date,
                                                                ),
                                                                "MMM dd, yyyy",
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-zen-600 mb-1">
                                                            Time:{" "}
                                                            {
                                                                appointment.appointment_time
                                                            }
                                                        </p>
                                                        {appointment.services &&
                                                            appointment.services
                                                                .length > 0 && (
                                                                <p className="text-sm text-zen-700 font-medium mt-2">
                                                                    Services:{" "}
                                                                    {appointment.services
                                                                        .map(
                                                                            (
                                                                                s,
                                                                            ) =>
                                                                                s.service_name,
                                                                        )
                                                                        .join(
                                                                            ", ",
                                                                        )}
                                                                </p>
                                                            )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            Completed
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Feedback Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="card-zen">
                            <div className="flex items-center mb-6">
                                <Star className="text-zen-600 mr-3" size={24} />
                                <h2 className="text-2xl font-zen font-bold text-zen-800">
                                    Leave Your Feedback
                                </h2>
                            </div>

                            {!selectedAppointment ? (
                                <div className="text-center py-12">
                                    <MessageCircle
                                        className="text-zen-300 mx-auto mb-4"
                                        size={64}
                                    />
                                    <p className="text-zen-600 text-lg">
                                        Select a completed appointment to leave
                                        feedback
                                    </p>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmitFeedback}
                                    className="space-y-6"
                                >
                                    {/* Selected Appointment Info */}
                                    <div className="bg-zen-50 rounded-lg p-4 border border-zen-200">
                                        <p className="text-sm text-zen-600 mb-1">
                                            Feedback for:
                                        </p>
                                        <p className="font-semibold text-zen-800">
                                            Appointment #
                                            {selectedAppointment.id}
                                        </p>
                                        <p className="text-sm text-zen-600">
                                            {format(
                                                new Date(
                                                    selectedAppointment.appointment_date,
                                                ),
                                                "MMMM dd, yyyy",
                                            )}{" "}
                                            at{" "}
                                            {
                                                selectedAppointment.appointment_time
                                            }
                                        </p>
                                    </div>

                                    {/* Overall Rating */}
                                    <div>
                                        <label className="block text-zen-800 font-medium mb-3">
                                            Overall Experience{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="flex items-center justify-center py-4 bg-zen-50 rounded-lg">
                                            <StarRatingComponent
                                                value={rating}
                                                setValue={setRating}
                                                size={50}
                                            />
                                        </div>
                                    </div>

                                    {/* Detailed Service Ratings */}
                                    <div className="bg-gradient-to-br from-zen-50 to-stone-50 rounded-xl p-6 border border-zen-200">
                                        <h3 className="text-lg font-semibold text-zen-800 mb-4 flex items-center">
                                            <Award
                                                className="mr-2 text-zen-600"
                                                size={20}
                                            />
                                            Detailed Service Ratings (Optional)
                                        </h3>

                                        <div className="space-y-4">
                                            {/* Service Quality */}
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Sparkles
                                                        className="text-blue-600"
                                                        size={20}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <StarRatingComponent
                                                        value={
                                                            serviceQualityRating
                                                        }
                                                        setValue={
                                                            setServiceQualityRating
                                                        }
                                                        size={32}
                                                        label="Service Quality"
                                                    />
                                                </div>
                                            </div>

                                            {/* Staff Friendliness */}
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Users
                                                        className="text-green-600"
                                                        size={20}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <StarRatingComponent
                                                        value={
                                                            staffFriendlinessRating
                                                        }
                                                        setValue={
                                                            setStaffFriendlinessRating
                                                        }
                                                        size={32}
                                                        label="Staff Friendliness"
                                                    />
                                                </div>
                                            </div>

                                            {/* Cleanliness */}
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Sparkles
                                                        className="text-purple-600"
                                                        size={20}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <StarRatingComponent
                                                        value={
                                                            cleanlinessRating
                                                        }
                                                        setValue={
                                                            setCleanlinessRating
                                                        }
                                                        size={32}
                                                        label="Cleanliness & Hygiene"
                                                    />
                                                </div>
                                            </div>

                                            {/* Value for Money */}
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                    <DollarSign
                                                        className="text-amber-600"
                                                        size={20}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <StarRatingComponent
                                                        value={
                                                            valueForMoneyRating
                                                        }
                                                        setValue={
                                                            setValueForMoneyRating
                                                        }
                                                        size={32}
                                                        label="Value for Money"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    <div>
                                        <label className="block text-zen-800 font-medium mb-2">
                                            Tell us about your experience{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            value={comments}
                                            onChange={(e) =>
                                                setComments(e.target.value)
                                            }
                                            placeholder="Share your thoughts about the service quality, staff friendliness, cleanliness, etc..."
                                            rows={6}
                                            required
                                            className="w-full px-4 py-3 border border-zen-300 rounded-lg focus:ring-2 focus:ring-zen-600 focus:border-transparent resize-none"
                                        />
                                        <p className="text-sm text-zen-500 mt-1">
                                            {comments.length} characters
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedAppointment(null);
                                                setRating(0);
                                                setServiceQualityRating(0);
                                                setStaffFriendlinessRating(0);
                                                setCleanlinessRating(0);
                                                setValueForMoneyRating(0);
                                                setComments("");
                                            }}
                                            className="flex-1 px-6 py-3 border border-zen-300 text-zen-700 rounded-lg hover:bg-zen-50 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={
                                                submitting ||
                                                rating === 0 ||
                                                !comments.trim()
                                            }
                                            className="flex-1 btn-zen flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    <span>Submitting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={20} />
                                                    <span>Submit Feedback</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12"
                >
                    <div className="card-zen bg-gradient-to-r from-zen-600 to-zen-700 text-white">
                        <div className="text-center">
                            <h3 className="text-2xl font-zen font-bold mb-3">
                                Why Your Feedback Matters
                            </h3>
                            <p className="text-zen-100 max-w-3xl mx-auto mb-4">
                                Your detailed feedback helps us maintain high
                                service standards and improve your future
                                experiences. We carefully review every rating
                                and comment to train our staff and enhance our
                                services.
                            </p>
                            <div className="grid md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-white/10 rounded-lg p-4">
                                    <Sparkles
                                        className="mx-auto mb-2"
                                        size={32}
                                    />
                                    <p className="text-sm">Service Quality</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                    <Users className="mx-auto mb-2" size={32} />
                                    <p className="text-sm">Staff Performance</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                    <Sparkles
                                        className="mx-auto mb-2"
                                        size={32}
                                    />
                                    <p className="text-sm">Cleanliness</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                    <DollarSign
                                        className="mx-auto mb-2"
                                        size={32}
                                    />
                                    <p className="text-sm">Value Assessment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Feedback;
