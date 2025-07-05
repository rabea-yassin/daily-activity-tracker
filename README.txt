
## **README.txt: Daily Activity Tracker**  

### **Project Overview**  
The **Daily Activity Tracker** is a simple yet powerful tool that helps you monitor how much time you spend on three core activities every day:  
- **Studying**  
- **Resting** (breaks, leisure, downtime)  
- **Sleeping**

The app tracks your time **live**, offers a **visual summary with a pie chart**, and lets you add manual time slots. The goal is to give you insights into your daily routines so you can **improve productivity and achieve a better work-rest balance**.

---

## **Features**  
1. **Three Activity Modes**  
   - **Studying**  
   - **Resting**  
   - **Sleeping**  
   Switch between modes with buttons to track time accurately. The system starts in **Rest Mode** by default.

2. **Live Time Tracking**  
   - The timers update **live every second**.  
   - You can always see the **current mode and its duration**.

3. **Sleep Schedule Management**  
   - Set a **custom sleep schedule** by specifying the start and end times.  
   - The **sleep time is automatically tracked** from the set times.  
   - Time beyond the sleep end is **reallocated to Rest Mode**.

4. **Manual Study Slot Input**  
   - Add a study session with **custom start and end times**.  
   - The app ensures that the slot **does not overlap with sleep** and **does not exceed the current time**.  
   - Time from **Rest Mode is subtracted** to accommodate the study session.

5. **Clear Data**  
   - Reset all timers with the **Clear Data button**.  
   - **Sleep schedules remain intact**, so you won’t need to re-enter them.

6. **Visual Summary with Pie Chart**  
   - Get a **visual breakdown** of your time with a live-updating pie chart.  
   - **Hover over the chart** to see the exact time spent in each mode.

---

## **How It Works**  
1. **Switching Modes**  
   - Click one of the **mode buttons** to start tracking time for that mode.  
   - The previous mode’s time is **logged automatically**.

2. **Setting Sleep Schedule**  
   - Use the **Sleep Start** and **Sleep End** fields to set your sleep schedule.  
   - When the schedule is saved, the **sleep time is calculated**, and any extra time is assigned to **Rest Mode**.

3. **Adding a Manual Study Slot**  
   - Enter the **start and end times** for a study session.  
   - Ensure the session does **not overlap with sleep** or **exceed the current time**.  
   - Resting time will be **reduced**, and the study timer will be updated.

---

## **Setup Instructions**  
1. **Clone the Repository or Download the Files**  
   - Ensure you have the following files in your project directory:  
     - `index.html`  
     - `styles.css`  
     - `script.js`  

2. **Open the Application**  
   - Open `index.html` in a web browser.

3. **Usage**  
   - Start tracking your activities by clicking the mode buttons.
   - Set your sleep schedule and add manual study slots as needed.

---

## **Technologies Used**  
- **HTML**: Provides the structure for the web page.  
- **CSS**: Styles the layout for a clean and user-friendly interface.  
- **JavaScript**: Manages timers, validations, mode switching, and chart updates.  
- **Chart.js**: Displays the time distribution with a pie chart.

---

## **How to Customize**  
- **Modify Colors**: Edit the `styles.css` file to change the colors of buttons and charts.  
- **Add Notifications**: Implement `alert()` or `setTimeout()` functions to notify when you switch modes too often.
- **Track More Activities**: Extend the app by adding new modes (e.g., Exercise, Work).

---

## **Known Issues and Future Improvements**  
- **Continuous Tracking for Multiple Days**: This version tracks only a **single day**. A future version could include **multiple-day summaries**.
- **Dark Mode Support**: Add a **dark mode toggle** for better accessibility.  
- **Mobile Responsiveness**: Currently optimized for desktops but could be further refined for mobile screens.

---

## **Author and License**  
Created by **Rabea Yassin**.  
Feel free to use, modify, and distribute this project for personal or educational purposes.

