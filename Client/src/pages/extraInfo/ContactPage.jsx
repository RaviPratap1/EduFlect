import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-gray-50">

      {/* Hero */}

      <section className="py-20 text-white bg-gradient-to-r from-primary-700 to-indigo-800">

        <div className="max-w-6xl px-6 mx-auto text-center">

          <h1 className="mb-4 text-5xl font-bold">
            Contact Us
          </h1>

          <p className="max-w-2xl mx-auto text-primary-100">
            Have questions or feedback? We'd love to hear from you.
          </p>

        </div>

      </section>

      {/* Contact Section */}

      <section className="py-16">

        <div className="grid max-w-6xl gap-8 px-6 mx-auto lg:grid-cols-3">

          {/* Left Cards */}

          <div className="space-y-5">

            <div className="p-6 duration-300 bg-white shadow rounded-2xl hover:shadow-lg">

              <Mail className="mb-3 text-primary-600"/>

              <h3 className="text-lg font-semibold">
                Email
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                support@eduflect.com
              </p>

            </div>

            <div className="p-6 duration-300 bg-white shadow rounded-2xl hover:shadow-lg">

              <Phone className="mb-3 text-primary-600"/>

              <h3 className="text-lg font-semibold">
                Phone
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                +91 9876543210
              </p>

            </div>

            <div className="p-6 duration-300 bg-white shadow rounded-2xl hover:shadow-lg">

              <MapPin className="mb-3 text-primary-600"/>

              <h3 className="text-lg font-semibold">
                Location
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Noida, India
              </p>

            </div>

          </div>

          {/* Form */}

          <div className="p-8 bg-white shadow lg:col-span-2 rounded-2xl">

            <h2 className="mb-6 text-2xl font-bold">
              Send a Message
            </h2>

            <form className="space-y-5">

              <div className="grid gap-4 sm:grid-cols-2">

                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-primary-500"
                />

                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-primary-500"
                />

              </div>

              <input
                type="text"
                placeholder="Subject"
                className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-primary-500"
              />

              <textarea
                rows="5"
                placeholder="Your Message"
                className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-primary-500"
              />

              <button
                className="flex items-center gap-2 px-8 py-3 text-white duration-300 bg-primary-600 rounded-xl hover:bg-primary-700"
              >
                <Send size={18}/>
                Send Message
              </button>

            </form>

          </div>

        </div>

      </section>

    </div>
  );
}