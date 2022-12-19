#pragma once

#include <iostream>
#include <map>
#include "ASpell.hpp"
#include "ATarget.hpp"

class Warlock
{
    private:
        std::string name;
        std::string title;
        Warlock &operator=(Warlock const &other);
        Warlock(void);
        Warlock(Warlock const &other);
        std::map<std::string, ASpell *> list;
    public:
        Warlock(std::string const &name, std::string const &title);
        ~Warlock();

        void introduce(void) const;

        std::string const &getTitle(void) const;
        std::string const &getName(void) const;

        void    setTitle(std::string const &title);
        void    learnSpell(ASpell *other);
        void    forgetSpell(std::string const &name);
        void launchSpell(std::string const &name, ATarget &other);
};