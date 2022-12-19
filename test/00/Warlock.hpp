#pragma once

#include <iostream>

class Warlock
{
    private:
        std::string name;
        std::string title;
        Warlock &operator=(Warlock const &other);
        Warlock(void);
        Warlock(Warlock const &other);
    public:
        Warlock(std::string const &name, std::string const &title);
        ~Warlock();

        void introduce(void) const;

        std::string const &getTitle(void) const;
        std::string const &getName(void) const;

        void    setTitle(std::string const &title);
};